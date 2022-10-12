const express = require('express')
const userCtrl = require('../controller/user.js');
const auth = require('../middleware/auth.js');
const userValidator = require('../validator/user.js');

const { User } = require('../model')

const router = express.Router()

//Authentication
router.post('/users/login', userValidator.login, userCtrl.login)

//Registration
//用中间件-验证模块来验证输入数据有效性
router.post('/users', userValidator.register, userCtrl.register)  //通过验证，执行具体的控制处理器

//Get Current User
router.get('/user', auth, userCtrl.getCurrUser)

//Update User
router.put('/user', userCtrl.updateCurrUser)

module.exports = router;