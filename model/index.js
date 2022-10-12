const mongoose = require('mongoose');
const {DBURL} = require('../config/config.js');
const User = require('./user.js');
const Tag = require('./tag.js');
const Article = require('./article.js');
const Comment = require('./comment.js');
const Favorite = require('./favorite.js');
const Follow = require('./follow.js');

//连接mongodb数据库
mongoose.connect(DBURL);

const db = mongoose.connection;
db.on('open', () => console.log('db connected'))

// 组织导出模型
module.exports = {
  User: User,
  Article: Article,
  Tag: Tag,
  Comment: Comment,
  Favorite,
  Follow
}