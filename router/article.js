const express = require('express')
const articleCtrl = require('../controller/article.js')
const auth = require('../middleware/auth.js');
const authNotRequired = require('../middleware/auth_not_required.js');
const articleValidator = require('../validator/article.js');

const router = express.Router()

//List Articles
router.get('/', authNotRequired ,articleCtrl.list)

//Feed Articles
router.get('/feed', articleCtrl.feed)

//Get Article
router.get('/:slug', authNotRequired, articleValidator.getArticle, articleCtrl.get)

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
router.delete('/:slug/comments/:id', articleCtrl.deleteComment)

//Favorite Article
router.post('/:slug/favorite', auth, articleCtrl.favorite)

//Unfavorite Article
router.delete('/:slug/favorite', articleCtrl.unfavorite)

module.exports = router;