const validate = require('../middleware/validator.js')
const { body } = require('express-validator');
const { User } = require('../model')
const md5 = require('../util/md5.js')

// 提取单独的验证模块
exports.register = validate([ //配置验证规则
  body('user.username')
    .notEmpty().withMessage('Username can not be Empty')
    .custom(async username => {  // 验证用户名唯一
      const user = await User.findOne({ username })

      if (user) {
        return Promise.reject('The username has already been used')
      }
    }),
  body('user.password').notEmpty().withMessage('Password can not be Empty'),
  body('user.email')
    .notEmpty().withMessage('Email can not be Empty')
    .isEmail().withMessage('Invalid Email format')
    .bail()  //前面验证失败，不再进行后面的验证
    .custom(async email => {  // 验证email唯一
      const user = await User.findOne({ email });
      if (user) {
        return Promise.reject('The email address has already been registered')
      }
    })
])

//只有非空验证通过，才会往后走，操作db，看email是否存在，password是否匹配，
//所以login是个中间件数组
exports.login = [
  //验证email格式正确，密码不为空
  validate([
    body('user.email')
      .notEmpty().withMessage('Email can not be Empty')
      .isEmail().withMessage('Invalid Email format'),

    body('user.password').notEmpty().withMessage('Password can not be Empty'),
  ]),
  //验证邮箱已经注册，密码匹配
  validate([
    body('user.email')
      .custom(async (email, { req }) => {
        // db中设置了查询默认不带pw
        // 强制要求查询时需要password
        const user = await User.findOne({ email }).select(['password', 'email', 'username', 'bio', 'image']);
        if (!user) {
          return Promise.reject('The email address is not registered yet')
        }
        //req在整个中间件流程中，共享一个，可以挂载数据,后续中间件也可以使用
        req.user = user;
      })
  ]),
  validate([
    body('user.password')
      .custom(async (pw, { req }) => {
        if (req.user.password !== md5(pw)) {
          return Promise.reject('The email address and password does not match')
        }
      })
  ])
]