const { Follow, User } = require('../model')

exports.getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const {user: currUser} = req;
    console.log(currUser)
    // get the user basic info from Users collection
    let user = await User.findOne({username}, "email bio image");
    user = user.toJSON()
    delete user._id
    // get the following relation from follows collection
    if(!currUser){
      user.following = false;
      return res.send(user);
    }

    const following = await Follow.findOne({username: currUser.username, following: username}, 'active')
    user.following = following.active

    res.send(user);
  } catch (err) {
    next(err);
  }
}

exports.followUser = async (req, res, next) => {
  try {
    const { user: { username: currUsername } } = req;
    const { username: authorname } = req.params;
    console.log('currentuser:' + currUsername, 'author:' + authorname)
    const author = await User.findOne({username: authorname})
    const followResult = await Follow.findOne({username: currUsername, following: authorname})
    console.log(followResult)
    // user try to follow himself
    if (authorname === currUsername) {
      res.status(400).end()
      return
    }

    // never followed before
    if (!followResult) {
      const follow = new Follow({username: currUsername, following: authorname})
      await follow.save()
      author.followerCount += 1
      await author.save()
      return res.send(username)
    }

    // already followed
    if (followResult.active) {
      res.status(400).end()
      return
    }

    // currently unfollowed,  refollow
    followResult.active = true
    await followResult.save()
    res.send(username)
  } catch (err) {
    next(err)
  }
}

exports.unfollowUser = async (req, res, next) => {
  try {
    const { username } = req.params
    res.send(username)
  } catch (err) {
    next(err)
  }
}