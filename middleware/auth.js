const jwt = require('../util/jwt.js');
const { JWTSECRET } = require('../config/config.js');
const { User } = require('../model')

// token authentication, get current user info
// store user info to req for latter middleware
module.exports = async (req, res, next) => {
  try {
    // 1.parse req headers and get token
    const auth = req.headers['authentication'];
    const token = auth ? auth.split(': ')[1] : null;
    // 2.no token response with 401
    if (!token) {
      res.status(401).end();
      return;
    }

    // parse token
    const parsedToken = await jwt.verify(token, JWTSECRET);

    // 3.verify token, store user info to req for latter middleware
    const user = await User.findById(parsedToken.userId)
    req.user = user;
    next();
  } catch (err) {
    // 4.not valid token, response with 401
    return res.status(401).end()
  }
}