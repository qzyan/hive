const mongoose = require('mongoose');
const baseModelSchema = require('./baseModel.js');
const Schema = mongoose.Schema;

const articleSchema = new mongoose.Schema({
  ...baseModelSchema,
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  body: {
    type: String,
    default: null
  },
  tagList: {
    type: [String],
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
  },
})

const Article = mongoose.model('Articles', articleSchema)

module.exports = Article