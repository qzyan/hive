const { Article, User, Comment, Favorite, Follow, Tag } = require('../model');
const { Types } = require('mongoose');

exports.list = async (req, res, next) => {
  try {
    const { offset = 0, limit = 10, tag, author, favoritedBy } = req.query;
    const { user } = req;
    const filter = {};

    // if tag is defined, tagList includes tag
    if (tag) {
      filter.tagList = tag
    }

    // if author is defiend, add to the filter
    if (author) {
      const authorResult = await User.findOne({ username: author })
      //get author _id, pass to filter
      filter.author = authorResult ? authorResult._id : null;
    }

    // if favoritedBy is defined, find all the articles favorited by the user and set as filter
    if (favoritedBy) {
      const favoritedByUserResult = await User.findOne({ username: favoritedBy });
      let favoritedarticleResult = await Favorite.aggregate()
        .match({ user_id: favoritedByUserResult ? favoritedByUserResult._id : null, active: true });

      favoritedarticleResult = favoritedarticleResult.map((ele) => ele.article_id);
      filter._id = { $in: favoritedarticleResult }
    }

    //get article and populate necessary fields
    const articles = await Article.aggregate()
      .match(filter)
      .lookup({
        from: 'favorites',
        localField: '_id',
        foreignField: 'article_id',
        pipeline: [
          { $match: { active: true, user_id: user ? user._id : null } },
        ],
        as: 'favorites'
      })
      .addFields({ favorited: { $size: '$favorites' } })
      .project({ favorites: 0 })
      // pagination
      .sort({ createdAt: -1 }) // des
      .skip(parseInt(offset))
      .limit(parseInt(limit))

    await Article.populate(articles, { path: 'author', select: 'username image' })

    //get article count
    const articlesCount = author || favoritedBy || tag ? await Article.countDocuments(filter) : await Article.estimatedDocumentCount();

    res.status(200).json({ articles, articlesCount })
  } catch (err) {
    next(err)
  }
}

exports.feed = async (req, res, next) => {
  try {
    // get current logged in user
    const { user: { username, _id } } = req;
    const { offset = 0, limit = 10 } = req.query;
    const filter = {};

    let followedUsers = await Follow.find({ username, active: true }, 'following');
    followedUsers = followedUsers.map(obj => obj.toJSON().following);
    followedUsers = await Promise.all(followedUsers.map(username => User.findOne({ username })));
    followedUsers = followedUsers.map(user => user._id)
    filter.author = { $in: followedUsers };

    const articles = await Article.aggregate()
      .match(filter)
      .lookup({
        from: 'favorites',
        localField: '_id',
        foreignField: 'article_id',
        pipeline: [
          { $match: { active: true, user_id: _id } },
        ],
        as: 'favorites'
      })
      .addFields({ favorited: { $size: '$favorites' } })
      .project({ favorites: 0 })
      // pagination
      .sort({ createdAt: -1 }) // des
      .skip(parseInt(offset))
      .limit(parseInt(limit))

    await Article.populate(articles, { path: 'author', select: 'username image' })

    const articlesCount = await Article.countDocuments(filter);

    res.send({ articles, articlesCount })
  } catch (err) {
    next(err)
  }
}

// get a single article by slug
exports.get = async (req, res, next) => {
  try {
    const { slug } = req.params;
    let article = await Article.findById(slug)
      .populate('author', '_id, username image')
    // .populate({
    //   path: 'commentList', select: 'author body createdAt favoritesCount',
    //   populate: { path: 'author', select: 'username image bio' }
    // })

    article = article.toJSON();

    //not a valid slug
    if (!article) {
      res.status(404).end()
    }

    const { user } = req;

    // see if the article is favorited or not
    //not logged in, none is favorted
    // author is not followed
    if (!user) {
      article.favorited = false;
      article.author.following = false;
    }

    //if logged in, iterate over each article if the article is favorited by the current user
    if (user) {
      const { _id: user_id, username } = user;
      const { author: { username: authorName } } = article
      let isFavorite = await Favorite.findOne({ user_id: Types.ObjectId(user_id), article_id: Types.ObjectId(slug) }, 'active');

      // isFavorite is null
      if (!isFavorite) {
        article.favorited = false;
      }
      if (isFavorite && isFavorite.active) {
        article.favorited = true;
      }
      if (isFavorite && !isFavorite.active) {
        article.favorited = false;
      }

      // see if author is followed by current user
      let isFollowing = await Follow.findOne({ username, following: authorName }, 'active')
      if (!isFollowing) {
        article.author.following = false;
      }
      if (isFollowing && isFollowing.active) {
        article.author.following = true;
      }
      if (isFollowing && !isFollowing.active) {
        article.author.following = false;
      }


    }




    res.status(200).json({ article })
  } catch (err) {
    next(err)
  }
}

exports.create = async (req, res, next) => {
  try {
    const article = new Article(req.body.article);
    article.tagList = [...new Set(article.tagList)];
    article.author = req.user._id;
    //article author is populated when send back
    //in db, author is id
    await article.save()
    await article.populate('author')

    // update tags
    await Tag.bulkWrite(article.tagList.map(tag => ({
      updateOne: {
        filter: { tagName: tag },
        update: { $inc: { articlesCount: 1 } },
        upsert: true,
      }
    })))
    res.status(201).json({ article })
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    const article = req.article
    const { article: toUpdate } = req.body

    toUpdate.tagList = [...new Set(toUpdate.tagList)];
    const newTags = toUpdate.tagList.filter(tag => !article.tagList.includes(tag));
    const deletedTags = article.tagList.filter(tag => !toUpdate.tagList.includes(tag));
    console.log("newTags", newTags)
    console.log("deletedTags", deletedTags)

    // update in memory
    article.title = toUpdate.title || article.title
    article.description = toUpdate.description || article.description
    article.body = toUpdate.body || article.body
    article.tagList = toUpdate.tagList || article.tagList
    article.updatedAt = new Date()

    // update in database
    await article.save()

    // update tags
    await Tag.bulkWrite(newTags.map(tag => ({
      updateOne: {
        filter: { tagName: tag },
        update: { $inc: { articlesCount: 1 } },
        upsert: true,
      }
    })))

    await Tag.bulkWrite(deletedTags.map(tag => ({
      updateOne: {
        filter: { tagName: tag },
        update: { $inc: { articlesCount: -1 } },
      }
    })))

    // return new article
    res.status(201).json(article)
  } catch (err) {
    next(err)
  }
}

exports.delete = async (req, res, next) => {
  try {
    const article = req.article;
    await article.remove();

    await Tag.bulkWrite(article.tagList.map(tag => ({
      updateOne: {
        filter: { tagName: tag },
        update: { $inc: { articlesCount: -1 } },
      }
    })))

    res.status(204).end();
  } catch (err) {
    next(err)
  }
}

exports.createComment = async (req, res, next) => {
  try {
    const { slug: articleId } = req.params;
    const { comment } = req.body;
    const { user: { _id: authorId } } = req;
    const newComment = new Comment(comment);
    newComment.article_id = articleId;
    newComment.author = authorId;

    await newComment.save();
    await newComment.populate('author');
    res.status(201).json({ comment: newComment });
  } catch (err) {
    next(err)
  }
}

exports.getComments = async (req, res, next) => {
  try {
    const { slug: articleId } = req.params;
    const comments = await Comment.find({ article_id: articleId }).sort({ 'createdAt': -1 }).populate('author', 'username image')
    res.status(200).json({ comments })
  } catch (err) {
    next(err)
  }
}

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = req.comment;
    await comment.remove();
    res.status(204).end();
  } catch (err) {
    next(err)
  }
}

exports.favorite = async (req, res, next) => {
  try {
    const { user: { _id: user_id } } = req;
    const { slug: article_id } = req.params;

    const fav = await Favorite.findOne({ article_id, user_id });
    const article = await Article.findById(article_id);
    // never liked the article before
    if (fav === null) {
      const newFav = new Favorite({ article_id, user_id });
      await newFav.save();
      article.favoritesCount += 1;
      article.save()
      return res.status(201).json({ msg: 'favorite succeeded' })
    }

    // currently favorite, unable to favor again
    if (fav.active) {
      return res.status(400).end()
    }
    // currently unfaved, to refavor
    fav.active = true
    await fav.save()
    article.favoritesCount += 1;
    article.save()
    res.status(201).json({ msg: 'refavorite succeeded' })
  } catch (err) {
    next(err)
  }
}

exports.unfavorite = async (req, res, next) => {
  try {
    const { user: { _id: user_id } } = req;
    const { slug: article_id } = req.params;

    const fav = await Favorite.findOne({ article_id, user_id });
    const article = await Article.findById(article_id);

    // currently favorite, to unfavor
    if (fav.active) {
      fav.active = false;
      await fav.save();
      article.favoritesCount -= 1;
      article.save()
      return res.status(201).json({ msg: 'unfavorite succeeded' })
    }
    // currently unfaved or never favorite before, unable to unfavorite
    return res.status(400).end()
  } catch (err) {
    next(err)
  }
}