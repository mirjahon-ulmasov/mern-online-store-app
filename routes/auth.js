const express = require('express');
const validator = require('express-validator');
const router = express.Router();
const User = require('../models/user');

const authControlller = require('../controllers/auth');

router.get('/login', authControlller.getLogin);

router.post(
  '/login',
  [
    validator
      .body('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail(),
    validator
      .body('password', 'Please enter a valid password')
      .isAlphanumeric()
      .isLength({ min: 5 })
      .trim(),
  ],
  authControlller.postLogin
);

router.post('/logout', authControlller.postLogout);

router.get('/signup', authControlller.getSignup);

router.post(
  '/signup',
  [
    validator
      .check('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(user => {
          // Authentication
          if (user) {
            return Promise.reject('Email already in use');
          }
        });
      })
      .normalizeEmail(),
    validator
      .body(
        'password',
        'Please enter a password with only numbers and text and at least 5 characters'
      )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    validator
      .body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match');
        }
        return true;
      })
      .trim(),
  ],

  authControlller.postSignup
);

router.get('/reset', authControlller.getReset);

router.post('/reset', authControlller.postReset);

router.get('/reset/:token', authControlller.getNewPassword);

router.post('/new-password', authControlller.postNewPassword);

module.exports = router;
