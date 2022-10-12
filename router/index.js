const express = require('express');
const router = express.Router()

router.get('/', (req, res) => {
  res.send('Hello World!')
})

//用户相关路由
router.use(require('./user.js'))

//profile相关路由
router.use('/profiles', require('./profile.js'))

//文章相关路由
router.use('/articles', require('./article.js'))

//tag相关路由
router.use('/tags', require('./tag.js'))


module.exports = router;