var User = require('../lib/user');

exports.form = function(req, res){
  res.render('login', {});
};

exports.submit = function(req, res, next){
  var data = req.body.user;
  User.authenticate(data.name, data.pass, function(err, user){
    if (err) return next(err);
    if (user) {
      req.session.uid = user.id;
      res.redirect('/');
    } else {
      res.locals.error = 'ユーザ名またはパスワードが正しくありません';
      exports.form(req, res);
    }
  });
}

// remove the session, which is detected by the cookieSession() 
// middleware, causing the session to be assigned for subsequent requests.
exports.logout = function(req, res){
  req.session = null;
  res.redirect('/');
};