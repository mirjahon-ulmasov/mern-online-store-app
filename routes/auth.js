const express = require('express');
const router = express.Router();

const authControlller = require('../controllers/auth');

router.get('/login', authControlller.getLogin);

router.post('/login', authControlller.postLogin);

router.post('/logout', authControlller.postLogout);

router.get('/signup', authControlller.getSignup);

router.post('/signup', authControlller.postSignup);

module.exports = router;
