const express = require('express')
const tagCtrl = require('../controller/tag.js')
const router = express.Router()

router.get('/', tagCtrl.getTags)

module.exports = router;