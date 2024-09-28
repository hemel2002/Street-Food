const requirelogin = (req, res, next) => {
  console.log(req.session.user_id);
  const user_id = req.session.user_id;
  if (!user_id || user_id[0] !== 'S'|| user_id !== req.params.id) {
    req.session.returnTo = req.originalUrl; // Store the original URL
    req.flash('requireLOGIN', 'Please login first');
    return res.redirect('/home/login');
  }
  next();
};

const requireloginuser = (req, res, next) => {
  const user_id = req.session.user_id ;

  // Check if user is logged in and matches the required ID format and route
  if (!user_id || user_id[0] !== 'U' || user_id !== req.params.id) {
    req.session.returnTo = req.originalUrl;  // Store original URL
    req.flash('requireLOGIN', 'Please login first');
    return res.redirect('/home/login');  // Redirect to login page
  }

  next();  // Proceed to the next middleware or route handler
};

const requireloginadmin = (req, res, next) => {
  console.log(req.session.user_id);
  const user_id = req.session.user_id;
  if (!user_id || user_id[0] !== 'A'|| user_id !== req.params.id) {
    req.session.returnTo = req.originalUrl; // Store the original URL
    req.flash('requireLOGIN', 'Please login first');
    return res.redirect('/home/login');
  }
  next();
};

module.exports = { requirelogin, requireloginuser, requireloginadmin };
