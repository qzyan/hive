const express = require('express');
const router = express.Router()

router.get('/', (req, res) => {
  res.send('Hello World!')
})

//user related routes
router.use(require('./user.js'))

//profile relted routes
router.use('/profiles', require('./profile.js'))

//article related routes
router.use('/articles', require('./article.js'))

//tag related routes
router.use('/tags', require('./tag.js'))


module.exports = router;