const mongoose = require('mongoose');
const baseModelSchema = require('./baseModel.js');
const Schema = mongoose.Schema;

const followSchema = new mongoose.Schema({
  ...baseModelSchema,
  username: {
    type: String,
    required: true
  },
  following: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}
)

const Follow = mongoose.model('Follows', followSchema)

module.exports = Follow