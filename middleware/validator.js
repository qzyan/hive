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

// validate if the field in locations is a valid objectid object in mongoose
validate.isValidObjectId = (locations, field) => {
  return buildCheckFunction(locations)(field).custom(async value => {
    if (!isValidObjectId(value)) {
      return Promise.reject('Not valid Article slug')
    }
  })
}
module.exports = validate;