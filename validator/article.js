const validate = require('../middleware/validator.js')
const { body, param } = require('express-validator')
const { isValidObjectId } = require('mongoose')
const { Article } = require('../model')

exports.createArticle = validate([
  body('article.title').notEmpty().withMessage('Article should include a title'),
  body('article.description').notEmpty().withMessage('Article should include an description'),
  body('article.body').notEmpty().withMessage('Article should include a body'),
]);

exports.getArticle = validate([
  //validate req.params.slug - if it is a valid objectid
  //if slug is not a valid id， fail the validation
  param('slug').custom(async slug => {
    if (!isValidObjectId(slug)) {
      return Promise.reject('Not valid Article slug')
    }
  })
]
)

exports.updateArticle = [
  // 1. validate if params.slug is a valid ojectid in mongoose
  // validate takes an array as parameter,
  // if the first validation middleware does not pass, the second middleware will not be called
  validate([
    validate.isValidObjectId(['params'], 'slug')
  ]),
  // 2. validate if article exist
  async (req, res, next) => {
    const { slug } = req.params
    const article = await Article.findById(slug)
    //return 404 if not exist
    if (!article) {
      return res.status(404).end()
    }
    req.article = article;
    next()
  },
  // 3. if article author is the current login user
  (req, res, next) => {
    // objectid object，unable to compare. need toString first
    if (req.user._id.toString() !== req.article.author.toString()) {
      return res.status(401).end()
    }

    next()
  },
]

exports.deleteArticle = exports.updateArticle