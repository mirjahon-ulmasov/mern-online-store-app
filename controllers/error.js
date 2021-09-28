exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    docTitle: 'Eror',
    path: '',
    isAuthenticated: req.session.isLoggedIn,
  });
};
