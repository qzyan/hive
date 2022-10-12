const util = require('util')

//科里化函数，
const errorHandler = () => (err, req, res, next) => {
  res.status(500).json({
    error: util.format(err)
  })
}

module.exports = errorHandler