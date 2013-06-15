var bcrypt = require('bcrypt')
  , async = require('async')
  , redis = require('redis');

if (process.env.REDISTOGO_URL) {
  var rtg = require('url').parse(process.env.REDISTOGO_URL);
  var db = redis.createClient(rtg.port, rtg.hostname);
  db.auth(rtg.auth.split(":")[1]);
} else {
  var db = redis.createClient();
}

module.exports = User;

function User(obj){
  for (var key in obj) {
    this[key] = obj[key];
  }
}

User.prototype.save = function(fn){
  if (this.id) {
    this.update(fn);
  } else {
    var self = this;
    // create a unique id
    db.incr('user:ids', function(err, id){
      if (err) return fn(err);
      self.id = id;

      // global user set
      db.zadd('users', id, id);

      self.hashPassword(function(err){
        if (err) return fn(err);
        self.update(fn);
      });
    });
  }
};

User.prototype.update = function(fn){
  db.set('user:id:' + this.name, this.id);
  db.hmset('user:' + this.id, this, fn);
  // Getting Error: hmset expected value to be a string
  // and found issue https://github.com/mranney/node_redis/issues/285
  // , but still not uploaded the newest package on npm. So,
  // git clone https://github.com/mranney/node_redis.git redis
  // should be nice to resolve this issue. (Redis 2.6.2, Mac OS X 64 bit)
};

User.prototype.hashPassword = function(fn){
  var self = this;
  // generate a 12 char salt
  bcrypt.genSalt(12, function(err, salt){
    if (err) return fn(err);
    self.salt = salt;
    // generate hash
    bcrypt.hash(self.pass, self.salt, function(err, hash){
      if (err) return fn(err);
      self.pass = hash;
      fn();
    });
  });
};

// lookup user id by name
User.getByName = function(name, fn){
  User.getId(name, function(err, id){
    if (err) return fn(err);
    // grab the user with id
    User.get(id, fn);
  });
};

User.getRange = function(from, to, fn){
  db.zrange('users', from, to, function(err, ids){
    if (err) return fn(err);

    async.map(ids, User.get, function(err, users){
      if (err) return fn(err);

      users = users.map(function(user){
        return User.toJSON(user);
      });
      return fn(err, users);
    });
  });
}

User.toJSON = function(user) {
  return {
    id: user.id,
    name: user.name
  };
}

// get id indexed by name
User.getId = function(name, fn){
  db.get('user:id:' + name, fn);
};

User.get = function(id, fn){
  // fetch plain-object hash
  db.hgetall('user:' + id, function(err, user){
    if (err) return fn(err);
    // convert the plain-object to a User
    fn(null, new User(user));
  });
};

User.authenticate = function(name, pass, fn){
  // lookup user by name
  User.getByName(name, function(err, user){
    if (err) return fn(err);
    if (!user.id) return fn();
    // hash the given password
    bcrypt.hash(pass, user.salt, function(err, hash){
      if (err) return fn(err);
      // we have a match!
      if (hash == user.pass) return fn(null, user);
      // invalid password
      fn();
    });
  });
};