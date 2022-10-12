const validate = require('../middleware/validator.js')
const { body } = require('express-validator');
const { User } = require('../model')
const md5 = require('../util/md5.js')

// validation for register route
exports.register = validate([
  body('user.username')
    .notEmpty().withMessage('Username can not be Empty')
    .custom(async username => {  // validate if username is unique
      const user = await User.findOne({ username })

      if (user) {
        return Promise.reject('The username has already been used')
      }
    }),
  body('user.password').notEmpty().withMessage('Password can not be Empty'),
  body('user.email')
    .notEmpty().withMessage('Email can not be Empty')
    .isEmail().withMessage('Invalid Email format')
    .bail()  //if previous validation failed, latter validation will not perform
    .custom(async email => {  // validate if email is unique
      const user = await User.findOne({ email });
      if (user) {
        return Promise.reject('The email address has already been registered')
      }
    })
])

// validation for register route
// only when email format is correct and password not empty
// will go to the next validtion middleware
exports.login = [
  // validate if email is in right format and if password is empty
  validate([
    body('user.email')
      .notEmpty().withMessage('Email can not be Empty')
      .isEmail().withMessage('Invalid Email format'),

    body('user.password').notEmpty().withMessage('Password can not be Empty'),
  ]),
  // validate if email has been registered
  validate([
    body('user.email')
      .custom(async (email, { req }) => {
        // db settting deault query without pw
        // require that this query need password
        const user = await User.findOne({ email }).select(['password', 'email', 'username', 'bio', 'image']);
        if (!user) {
          return Promise.reject('The email address is not registered yet')
        }
        //mount user to req. req can be used to add data since all middlewares share the same req
        req.user = user;
      })
  ]),
  // and if password matches
  validate([
    body('user.password')
      .custom(async (pw, { req }) => {
        if (req.user.password !== md5(pw)) {
          return Promise.reject('The email address and password does not match')
        }
      })
  ])
]