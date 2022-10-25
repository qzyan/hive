const { User } = require('../model');
const jwt = require('../util/jwt.js');
const { JWTSECRET } = require('../config/config.js');

exports.register = async (req, res, next) => {
  try {
    //1. parse req body
    const user = req.body.user;
    //2. data validation - prev middleware
    //2.1 basic data validation
    //2.2 resigter data validation

    //3. pass validation, save data to db
    let newUser = await User.create(user);
    newUser = newUser.toJSON();
    //mongdb object unable to delete ,turn to normal object first
    delete newUser.password;
    // generate token
    const token = await jwt.sign({
      userId: newUser._id
    }, JWTSECRET, { expiresIn: 60 * 60 * 24 })
    //4. send success res
    res.json({ user: { ...newUser, token } })
  } catch (err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    // 1。 pass validation
    // 2. generate token

    const user = req.user.toJSON()
    // token保存用户id足够,其他意义不大
    // by default valid forever, set a exp
    const token = await jwt.sign({
      userId: user._id
    }, JWTSECRET, { expiresIn: 60 * 60 * 24 * 365 })

    // 3. send success res， user data and token
    delete user.password
    res.status(200).json({ user: { ...user, token } })
  } catch (err) {
    next(err)
  }
}


exports.getCurrUser = async (req, res, next) => {
  try {
    //处理req
    res.status(200).send({ user: req.user.toJSON() });
  } catch (err) {
    next(err)
  }
}

exports.updateCurrUser = async (req, res, next) => {
  try {
    const { user } = req;
    const { user: toUpdate } = req.body;
    user.username = toUpdate.username || user.username
    user.email = toUpdate.email || user.email
    if (toUpdate.password) {
      user.password = toUpdate.password
    }
    user.bio = toUpdate.bio || user.bio
    user.image = toUpdate.image || user.image
    user.updatedAt = new Date()

    await user.save();

    const updatedUser = user.toJSON();
    delete updatedUser.password;

    const token = await jwt.sign({
      userId: updatedUser._id
    }, JWTSECRET, { expiresIn: 60 * 60 * 24 * 365 })

    res.status(200).send({ user: { ...updatedUser, token } });
  } catch (err) {
    next(err)
  }
}