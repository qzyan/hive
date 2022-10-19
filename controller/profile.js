const { Follow, User } = require('../model')

exports.getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { user: currUser } = req;

    // get the user basic info from Users collection
    let user = await User.findOne({ username }, "email bio image username");
    user = user.toJSON()
    delete user._id
    // get the following relation from follows collection
    if (!currUser) {
      user.following = false;
      return res.send({ profile: user });
    }

    const following = await Follow.findOne({ username: currUser.username, following: username }, 'active')
    user.following = following.active

    res.send({ profile: user });
  } catch (err) {
    next(err);
  }
}

exports.followUser = async (req, res, next) => {
  try {
    // logged in user
    const { user: { username: currUsername } } = req;
    // article author
    const { username: authorname } = req.params;

    const author = await User.findOne({ username: authorname })
    const followResult = await Follow.findOne({ username: currUsername, following: authorname })

    // user try to follow himself
    if (authorname === currUsername) {
      res.status(400).end()
      return
    }

    // never followed before
    if (!followResult) {
      const follow = new Follow({ username: currUsername, following: authorname })
      await follow.save();
      author.followerCount += 1;
      await author.save();
      return res.send({
        profile: {
          username: author.username,
          bio: author.bio,
          image: author.image,
          following: true
        }
      });
    }

    // already followed
    if (followResult.active) {
      res.status(400).end()
      return
    }

    // currently unfollowed,  refollow
    followResult.active = true;
    await followResult.save();
    author.followerCount += 1;
    await author.save();
    return res.send({
      profile: {
        username: author.username,
        bio: author.bio,
        image: author.image,
        following: true
      }
    });
  } catch (err) {
    next(err);
  }
}

exports.unfollowUser = async (req, res, next) => {
  try {
    // logged in user
    const { user: { username: currUsername } } = req;
    // article author
    const { username: authorname } = req.params;

    const author = await User.findOne({ username: authorname });
    const followResult = await Follow.findOne({ username: currUsername, following: authorname });

    // already followed
    if (followResult.active) {
      followResult.active = false;
      await followResult.save();
      author.followerCount -= 1;
      await author.save();
      return res.send({
        profile: {
          username: author.username,
          bio: author.bio,
          image: author.image,
          following: false
        }
      });
    }

    // never followed before or currently unfollowed
    res.status(400).end()
  } catch (err) {
    next(err)
  }
}