const requirelogin = (req, res, next) => {
  console.log(req.session.user_id);
  const user_id = req.session.user_id;
  if (!user_id || user_id[0] !== 'S') {
    req.flash('requireLOGIN', 'Please login first');
    return res.redirect('/home');
  }
  next();
};

const requireloginuser = (req, res, next) => {
  console.log(req.session.user_id);
  const user_id = req.session.user_id;
  if (!user_id || user_id[0] !== 'U') {
    req.flash('requireLOGIN', 'Please login first');
    return res.redirect('/home');
  }
  next();
};

module.exports = { requirelogin, requireloginuser };
