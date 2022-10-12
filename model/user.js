const mongoose = require('mongoose');
const baseModelSchema = require('./baseModel.js');
const Schema = mongoose.Schema;
const md5 = require('../util/md5.js');


//create schema
const userSchema = new mongoose.Schema({
  ...baseModelSchema,

  username: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true,
    set: value => md5(value), //加密
    select: false //查询数据时，不会获取此项数据。创造时，还是会返回
  },

  bio: {
    type: String,
    default: null
  },
  image: {
    type: String,
    default: null
  },
  followerCount: {
    type: Number,
    default: 0
  }
});

// create model
const User = mongoose.model('Users', userSchema);

module.exports = User;