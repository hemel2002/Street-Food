const requirelogin = (req, res, next) => {
  console.log(req.session.user_id);
  const user_id = req.session.user_id;
  if (!user_id || user_id[0] !== 'S') {
    req.session.returnTo = req.originalUrl; // Store the original URL
    req.flash('requireLOGIN', 'Please login first');
    return res.redirect('/home/login');
  }
  next();
};

const requireloginuser = (req, res, next) => {
  console.log(req.session.user_id);
  const user_id = req.session.user_id;
  if (!user_id || user_id[0] !== 'U') {
    req.session.returnTo = req.originalUrl; // Store the original URL
    req.flash('requireLOGIN', 'Please login first');
    return res.redirect('/home/login');
  }
  next();
};

const requireloginadmin = (req, res, next) => {
  console.log(req.session.user_id);
  const user_id = req.session.user_id;
  if (!user_id || user_id[0] !== 'A') {
    req.session.returnTo = req.originalUrl; // Store the original URL
    req.flash('requireLOGIN', 'Please login first');
    return res.redirect('/home/login');
  }
  next();
};

module.exports = { requirelogin, requireloginuser, requireloginadmin };
