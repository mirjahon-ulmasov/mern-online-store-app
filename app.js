// Packages
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI =
  'mongodb://Mirjahon:reactdeveloper@cluster0-shard-00-00.jlmh3.mongodb.net:27017,cluster0-shard-00-01.jlmh3.mongodb.net:27017,cluster0-shard-00-02.jlmh3.mongodb.net:27017/shop?ssl=true&replicaSet=atlas-12j0xd-shard-0&authSource=admin&retryWrites=true&w=majority';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

app.set('view engine', 'ejs'); // "pug"
app.set('views', 'views'); // "views/pug"

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Setup
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrf());
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.email = req.session.user ? req.session.user.email : '';
  next();
});

// Routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

// Connect to MongoDB using mongoose
mongoose
  .connect(MONGODB_URI)
  .then(() => app.listen(3000))
  .catch(err => console.log(err));
