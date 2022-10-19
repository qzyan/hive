const { Article, User, Comment, Favorite, Follow } = require('../model');
const { Types } = require('mongoose');

exports.list = async (req, res, next) => {
  try {
    const { offset = 0, limit = 20, tag, author } = req.query
    const filter = {}
    // tagList includes tag
    if (tag) {
      filter.tagList = tag
    }

    if (author) {
      //get auhor _id, pass to filter
      const user = await User.findOne({ username: author })
      filter.author = user ? user._id : null;
    }

    //get article and populate necessary fields
    let articles = await Article.find(filter)
      .populate('author', 'username image')
      // .populate({ path: 'commentList', select: 'author body createdAt favoritesCount', populate: { path: 'author', select: 'username image' } })
      // pagination
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 }) // des

    articles = articles.map(article => article.toJSON());

    //get article count
    const articlesCount = await Article.estimatedDocumentCount();

    const { user } = req;
    // see if the article is favorited or not
    //not logged in, none is favorted
    //if logged in, iterate over each article if the article is favorited by the current user
    if (user) {
      const { _id: user_id } = user;
      let favedArticlesIds = await Favorite.find({ user_id, active: true }, 'article_id');
      favedArticlesIds = favedArticlesIds.map(idObj => idObj.article_id.toJSON());
      favedArticlesIds = new Set(favedArticlesIds)

      articles.forEach(article => {
        if (favedArticlesIds.has(article._id.toJSON())) {
          article.favorited = true;
        } else {
          article.favorited = false;
        }
      })
    }

    res.status(200).json({
      articles,
      articlesCount
    })
  } catch (err) {
    next(err)
  }
}

exports.feed = async (req, res, next) => {
  try {
    res.send('feed articles')
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
    article.author = req.user._id;
    //将article.author的数据映射到author
    //数据库中保存的仍然是id
    await article.save()
    await article.populate('author')
    res.status(201).json({ article })
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  try {
    // 把document转换为普通对象
    const article = req.article
    const { article: toUpdate } = req.body
    // 内存内的跟新
    article.title = toUpdate.title || article.title
    article.description = toUpdate.description || article.description
    article.body = toUpdate.body || article.body
    article.updatedAt = new Date()

    // 数据库内的跟新
    await article.save()
    // 返回跟新后的文章
    res.status(201).json(article)
  } catch (err) {
    next(err)
  }
}

exports.delete = async (req, res, next) => {
  try {
    const article = req.article;
    await article.remove();
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
    res.send('delete comment')
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