const express = require('express');
const router = express.Router();
const userController = require('../controllers/user')
const passport = require('passport');
const { storeReturnTo } = require('../checkLogin');

router.get('/register', userController.renderRegForm);

router.post('/register', userController.create);

router.get('/login', userController.renderLoginForm);

router.post('/login', storeReturnTo, 
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), 
    userController.login);

router.get('/logout', userController.logout);

module.exports = router;