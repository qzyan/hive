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
  //验证req.params.slug - 是否为有效的objectid
  //如果不是有效id，验证失败
  param('slug').custom(async slug => {
    if (!isValidObjectId(slug)) {
      return Promise.reject('Not valid Article slug')
    }
  })
]
)

exports.updateArticle = [
  //与getArticle一样，都要验证id是否有效，封装
  // 1. 验证params.slug是否为mongoose中有效的ojectid
  validate([
    validate.isValidObjectId(['params'], 'slug')
  ]),
  // 2. 文章是否存在
  async (req, res, next) => {
    const { slug } = req.params
    const article = await Article.findById(slug)
    //没找到，返回404
    if (!article) {
      return res.status(404).end()
    }
    req.article = article;
    next()
  },
  // 3. 文章作者是否为当前登陆用户
  (req, res, next) => {
    // 两个都是objectid对象，无法比较
    if (req.user._id.toString() !== req.article.author.toString()) {
      return res.status(401).end()
    }

    next()
  },
]

exports.deleteArticle = exports.updateArticle