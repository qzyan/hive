const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const router = require('./router')
const errorHandler = require('./middleware/errorHandler.js')
require('dotenv').config()
require('./model')


const app = express()
const port = process.env.PORT || 3000

//mount middlewares
app.use(express.json());
//log
app.use(morgan('dev'));
//cors
app.use(cors())

//routes
app.use('/api', router)

//error handling middleware
app.use(errorHandler())

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})