const {User} = require('../model');
const jwt = require('../util/jwt.js');
const { JWTSECRET } = require('../config/config.js');

exports.register = async(req, res, next) => {
  try {
    //1. parse req body
    const user = req.body.user;
    //2. 数据验证 - 放在单独的中间件中验证
    //2.1 基本数据验证
    //2.2 业务数据验证

    //3. 验证通过，数据储存到数据库
    let newUser = await User.create(user);
    newUser = newUser.toJSON();
    //mongdb对象删不掉此项,要转换为普通对象
    delete newUser.password;
    // 生成token
    const token = await jwt.sign({
      userId: newUser._id
    }, JWTSECRET, { expiresIn: 60*60*24})
    //4. 发送成功响应
    res.json({user: {...newUser, token}})
  } catch (err) {
    next(err)
  }
}

exports.login = async(req, res, next) => {
  try {
    // 1。 通过验证
    // 2. 生成token

    const user = req.user.toJSON()
    // token保存用户id足够,其他意义不大
    // 默认永久有效
    const token = await jwt.sign({
      userId: user._id
    }, JWTSECRET, { expiresIn: 60*60*24})

    // 3. 发送成功消息， 返回生成的user和token
    delete user.password
    res.status(200).json({user: {...user, token}})
  } catch (err) {
    next(err)
  }
}


exports.getCurrUser = async(req, res, next) => {
  try {
    //处理req
    res.status(200).send({user: req.user.toJSON()});
  } catch (err) {
    next(err)
  }
}

exports.updateCurrUser = async(req, res, next) => {
  try {
    //处理req
  } catch (err) {
    next(err)
  }
}