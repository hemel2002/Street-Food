const requirelogin = (req, res, next) => {
  console.log(req.session.user_id);
  if (!req.session.user_id) {
    req.flash('requireLOGIN', 'Please login first');
    return res.redirect('/home');
  }
  next();
};

module.exports = requirelogin;
