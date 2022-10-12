
const express = require('express')
const auth = require('../middleware/auth.js')
const profileCtrl = require('../controller/profile.js')

const router = express.Router()


//Get Profile
router.get('/:username', profileCtrl.getProfile)

//Follow user
router.post('/:username/follow', auth,profileCtrl.followUser)

//Unfollow user
router.delete('/:username/follow', profileCtrl.unfollowUser)

module.exports = router