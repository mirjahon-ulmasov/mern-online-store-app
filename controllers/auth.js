require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const validator = require('express-validator');

// Email Service Setup
const SibApiV3Sdk = require('sib-api-v3-sdk');
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    docTitle: 'Login',
    errorMessage: null,
    oldInput: { email: '', password: '' },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validator.validationResult(req);
  // Validation 
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      docTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: errors.array(),
    });
  }
  // Authentication
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          path: '/login',
          docTitle: 'Login',
          errorMessage: 'Invalid email address',
          oldInput: { email: email, password: password },
          validationErrors: [],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(() => {
              res.redirect('/');

              apiInstance
                .sendTransacEmail({
                  sender: {
                    email: 'mirjahonulmasov@gmail.com',
                    name: 'Mirjahon Ulmasov',
                  },
                  to: [{ email: email }],
                  subject: 'Login succeeded!',
                  htmlContent:
                    '<html><head></head><body><h2>You successfully login!</h2></body></html>',
                  headers: {
                    'X-Mailin-custom':
                      'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
                  },
                })
                .catch(err => console.log(err));
            });
          }
          return res.status(422).render('auth/login', {
            path: '/login',
            docTitle: 'Login',
            errorMessage: 'Invalid password',
            oldInput: { email: email, password: password },
            validationErrors: [],
          });
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    docTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validator.validationResult(req);
  // Validation 
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      docTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then(hashPassword => {
      const user = new User({
        email: email,
        password: hashPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(() => {
      res.redirect('/login');

      apiInstance
        .sendTransacEmail({
          sender: {
            email: 'mirjahonulmasov@gmail.com',
            name: 'Mirjahon Ulmasov',
          },
          to: [{ email: email }],
          subject: 'Signup succeeded!',
          htmlContent:
            '<html><head></head><body><h2>You successfully signed up!</h2></body></html>',
          headers: {
            'X-Mailin-custom':
              'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
          },
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    docTitle: 'Reset Password',
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'No account found with that email');
          return res.redirect('/reset');
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save().then(result => {
          res.redirect('/');
          apiInstance
            .sendTransacEmail({
              sender: {
                email: 'mirjahonulmasov@gmail.com',
                name: 'Mirjahon Ulmasov',
              },
              to: [{ email: req.body.email }],
              subject: 'Password reset!',
              htmlContent: `<html><head></head><body>
                <h2>You requested a password reset</h2>
                <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
                </body></html>`,
              headers: {
                'X-Mailin-custom':
                  'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
              },
            })
            .catch(err => console.log(err));
        });
      })
      .catch(err => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      res.render('auth/new-password', {
        path: '/new-password',
        docTitle: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch(err => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
  const { userId, password, passwordToken } = req.body;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then(hashPassword => {
      resetUser.password = hashPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      res.redirect('/login');
    })
    .catch(err => console.log(err));
};
