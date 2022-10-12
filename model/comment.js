const mongoose = require('mongoose');
const baseModelSchema = require('./baseModel.js');
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema({
  ...baseModelSchema,
  article_id: {
    type:Schema.Types.ObjectId,
    required: true
  },
  body: {
    type: String,
    default: null
  },
  favoritesCount: {
    type: Number,
    default: 0
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
    required: true
  }
})

const Comment = mongoose.model('Comments', commentSchema)

module.exports = Comment