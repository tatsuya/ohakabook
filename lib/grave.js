var redis = require('redis');

if (process.env.REDISTOGO_URL) {
  var rtg = require('url').parse(process.env.REDISTOGO_URL);
  var db = redis.createClient(rtg.port, rtg.hostname);
  db.auth(rtg.auth.split(":")[1]);
} else {
  var db = redis.createClient();
}

module.exports = Grave;

function Grave(obj) {
  for (var key in obj) {
    this[key] = obj[key];
  }
}

Grave.prototype.save = function(fn){
  if (this.id) {
    this.update(fn);    
  }
}

Grave.prototype.update = function(fn){
  var self = this;
  db.hmset('user:' + self.id + ':grave', self, fn);
}

Grave.get = function(id, fn){
  db.hgetall('user:' + id + ':grave', function(err, grave){
    if (err) return fn(err);
    fn(null, new Grave(grave));
  });
};