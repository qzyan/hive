
const express = require('express');
const auth = require('../middleware/auth.js');
const authOptional = require('../middleware/auth_optional.js');
const profileCtrl = require('../controller/profile.js');

const router = express.Router();


//Get Profile
router.get('/:username', authOptional, profileCtrl.getProfile);

//Follow user
router.post('/:username/follow', auth, profileCtrl.followUser);

//Unfollow user
router.delete('/:username/follow', profileCtrl.unfollowUser);

module.exports = router;