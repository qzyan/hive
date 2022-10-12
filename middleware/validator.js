const { validationResult, buildCheckFunction } = require('express-validator')
const { isValidObjectId } = require('mongoose')
// can be reused by many routes

// parallel processing
// validations - array of validation rules
// return a middleware which will validate the request according to the validations params
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

// 封装验证传递的id是否为mongoose中有效的objectid类型
validate.isValidObjectId = (locations, field) => {
  return buildCheckFunction(locations)(field).custom(async value => {
    if (!isValidObjectId(value)) {
      return Promise.reject('Not valid Article slug')
    }
  })
}
module.exports = validate;