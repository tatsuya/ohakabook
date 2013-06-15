var Grave = require('../lib/grave')
  , User = require('../lib/user');

exports.show = function(req, res, next){
  if (!req.user) {
    res.render('index', {});
  } else {

    Grave.get(req.user.id, function(err, grave){
      if (err) return next(err);

      User.getRange(0, -1, function(err, users){
        if (grave && grave.offerings) {
          res.render('index', {
            offerings: grave.offerings.split(','),
            users: users
          });
        } else {
          res.render('index', {
            users: users
          });
        }
      });
    });
  }
}

exports.user = function(req, res, next){
  var name = req.params.user;

  User.getId(name, function(err, id){
    if (err) return next(err);

    Grave.get(id, function(err, grave){
      if (err) return next(err);

      if (Object.keys(grave).length > 0) {
        var offerings = [];
        if (grave.offerings) {
          offerings = grave.offerings.split(',');
        }
        res.render('grave', {
          name: name,
          offerings: offerings
        });
      } else {
        res.render('404', {});
      }
    });
  });
}

exports.add = function(req, res, next){
  var user = req.body.user;
  var offerings = req.body.offerings;

  User.getId(user, function(err, id){
    if (err) return fn(err);

    var newGrave = { id: id };

    Grave.get(id, function(err, currentGrave){
      if (err) return next(err);

      if (currentGrave && currentGrave.offerings) {
        currentOfferings = currentGrave.offerings.split(',');
        newGrave.offerings = currentOfferings.concat(offerings);
      } else {
        newGrave.offerings = offerings;
      }

      var grave = new Grave(newGrave);

      grave.save(function(err){
        if (err) return next(err);
        res.send({ message: 'OK' });
      });
    });

  });
}

Grave.create = function(id, fn){
  var grave = new Grave({ id: id });
  grave.save(fn);
}