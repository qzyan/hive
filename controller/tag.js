const { Tag } = require('../model');

exports.getTags = async (req, res, next) => {
  try {
    const popularTags = await Tag
      .find({})
      .select('tagName -_id')
      .sort({ articlesCount: -1 })
      .limit(10);
    const tags = popularTags.map(tag => tag.tagName)
    res.status(200).json({ tags })
  } catch (err) {
    next(err)
  }
}