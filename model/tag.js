const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  tagName: {
    type: String,
    required: true
  },
  articlesCount: {
    type: Number,
    default: 1
  }
})

const Tag = mongoose.model('Tags', tagSchema)

module.exports = Tag