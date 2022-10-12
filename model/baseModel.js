const baseModelSchema = {
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}


module.exports = baseModelSchema;