const jwt = require('../util/jwt.js');
const { JWTSECRET } = require('../config/config.js');
const { User } = require('../model')

//进行身份认证,获取当前登陆用户
//将当前token的用户信息挂载到req上
module.exports = async (req, res, next) => {
  try {
    // 1.解析请求头，获取tokne信息
    const auth = req.headers['authentication'];
    const token = auth ? auth.split(': ')[1] : null;
    // 2.无效 - 继续
    if (!token) {
      next();
      return;
    }

    // 验证
    const parsedToken = await jwt.verify(token, JWTSECRET);

    // 4.有效 - 把用户信息挂载到req上，继续往后执行
    const user = await User.findById(parsedToken.userId)
    req.user = user;
    next();
  } catch (err) {
    // 3.验证token, 失败返回401
    next()
  }
}