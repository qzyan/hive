const express = require('express')
const articleCtrl = require('../controller/article.js')
const auth = require('../middleware/auth.js');
const authOptional = require('../middleware/auth_optional.js');
const articleValidator = require('../validator/article.js');
const commentValidator = require('../validator/comment.js')

const router = express.Router()

//List Articles
router.get('/', authOptional, articleCtrl.list)

//Feed Articles
router.get('/feed', auth, articleCtrl.feed)

//Get Article
router.get('/:slug', authOptional, articleValidator.getArticle, articleCtrl.get)

//Create Article
router.post('/', auth, articleValidator.createArticle, articleCtrl.create)

//Update Article
router.put('/:slug', auth, articleValidator.updateArticle, articleCtrl.update)

//Delete Article
router.delete('/:slug', auth, articleValidator.deleteArticle, articleCtrl.delete)

//Add Comments to an Article
router.post('/:slug/comments', auth, articleCtrl.createComment)

//Get Comments from an Article
router.get('/:slug/comments', articleCtrl.getComments)

//Delete Comment
router.delete('/:slug/comments/:id', auth, commentValidator.deleteComment, articleCtrl.deleteComment)

//Favorite Article
router.post('/:slug/favorite', auth, articleCtrl.favorite)

//Unfavorite Article
router.delete('/:slug/favorite', auth, articleCtrl.unfavorite)

module.exports = router;
