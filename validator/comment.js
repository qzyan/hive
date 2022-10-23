const validate = require('../middleware/validator.js')
const { body, param } = require('express-validator')
const { isValidObjectId } = require('mongoose')
const { Comment } = require('../model')

exports.deleteComment = [
  validate([
    validate.isValidObjectId(['params'], 'slug'),
    validate.isValidObjectId(['params'], 'id'),
  ]),
  // 2. validate if comment exist
  async (req, res, next) => {
    const { id } = req.params
    const comment = await Comment.findById(id)
    //return 404 if not exist
    if (!comment) {
      return res.status(404).end()
    }

    req.comment = comment;
    next()
  },
  // 3. validate if article id matches the slug
  (req, res, next) => {
    const { slug } = req.params
    if (req.comment.article_id.toString() !== slug) {
      return res.status(400).json({ err: 'comment is not about this article' })
    }

    next()
  },
  // 4. if comment author is the current login user
  (req, res, next) => {
    // objectid object，unable to compare. need toString first
    if (req.user._id.toString() !== req.comment.author.toString()) {
      return res.status(401).end()
    }

    next()
  },
]