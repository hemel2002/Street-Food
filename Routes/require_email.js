const require_email = (req, res, next) => {
  console.log(req.session.user_email);
  const user_email = req.session.user_email;
  if (!user_email) {
    req.flash('forget_error', 'Please enter email first');
    return res.redirect('/forget');
  }
  next();
};
module.exports = require_email;
