var redis = require('redis')
  , bcrypt = require('bcrypt')
  , async = require('async')
  // , db = redis.createClient();
  db = redis.createClient(process.env.REDISTOGO_URL);

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

// By the JSON response, both the user's password and salt are provided in the 
// response. To get alter this you may implement a .toJSON() on the 
// User.protoype:. If the same request were to be issued you would now 
// receive only the id and name properties:
User.prototype.toJSON = function(){
  return {
    id: this.id,
    name: this.name
  }
}

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
      console.log(users);
      return fn(err, users);
    });
  });
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