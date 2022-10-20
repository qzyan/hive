const jwt = require('../util/jwt.js');
const { JWTSECRET } = require('../config/config.js');
const { User } = require('../model')


module.exports = async (req, res, next) => {
  try {
    // 1.parse req headers，get tokne
    const auth = req.headers['authentication'];
    const token = auth ? auth.split(': ')[1] : null;
    // 2.no token, no logged in user, continue to next middleware
    if (!token || token === 'undefined') {
      next();
      return;
    }

    // 3. token exists, verify the token
    const parsedToken = await jwt.verify(token, JWTSECRET);

    // valid token - mount the user data to req，continue to next middleware
    const user = await User.findById(parsedToken.userId)
    req.user = user;
    next();
  } catch (err) {
    // 4.not valid token, response with 401
    return res.status(401).end()
  }
}