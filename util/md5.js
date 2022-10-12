const crypto = require('crypto');
const {SALT} = require('../config/config.js');

module.exports = (password) => {
  return crypto.createHash('md5').update(SALT + password).digest('hex')
}
