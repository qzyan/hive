const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const router = require('./router')
const errorHandler = require('./middleware/errorHandler.js')
require('dotenv').config()
require('./model')


const app = express()
const port = process.env.PORT || 3000

//配置中间件
app.use(express.json());
//日志输出
app.use(morgan('dev'));
//跨域响应
app.use(cors())

//挂载路由
app.use('/api', router)

//挂载错误处理中间件
app.use(errorHandler())

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})