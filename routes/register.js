var User = require('../lib/user')
  , Grave = require('../lib/grave');

exports.form = function(req, res){
  res.render('register', {});
}

exports.submit = function(req, res, next){
  var data = req.body.user;

  User.getByName(data.name, function(err, user){
    if (err) return next(err);

    if (user.id) {
      res.locals.error = 'そのユーザ名はすでに登録されています';
      exports.form(req, res);

    // create a user
    } else {
      user = new User({
        name: data.name,
        pass: data.pass
      });

      user.save(function(err){
        if (err) return next(err);

        Grave.create(user.id, function(err){
          if (err) return next(err);

          // store the uid for authentication
          req.session.uid = user.id;
          res.redirect('/');
        });
      });
    }
  });
}

