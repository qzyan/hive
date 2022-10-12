const mongoose = require('mongoose');
const baseModelSchema = require('./baseModel.js');

const Schema = mongoose.Schema;



const favoriteSchema = new mongoose.Schema({
  ...baseModelSchema,
  article_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
});

const Favorite = mongoose.model('favorites', favoriteSchema);

module.exports = Favorite;