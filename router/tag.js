const express = require('express')
const tagCtrl = require('../controller/tag.js')
const router = express.Router()

// get the most popular tags
router.get('/', tagCtrl.getTags)

module.exports = router;