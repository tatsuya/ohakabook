var redis = require('redis')
  // , db = redis.createClient();
  db = redis.createClient(process.env.REDISTOGO_URL);

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

// function Grave(obj) {
//   for (var key in obj) {
//     this[key] = obj[key];
//   }
// }

// Offering.prototype.save = function(fn){
//   if (this.id) {
//     this.update(fn);
//   } else {
//     var self = this;

//     // increment ids
//     db.incr('offering:ids', function(err, id){
//       if (err) return fn(err);
//       self.id = id;
//       // user-specific Offering set
//       db.zadd('user:' + self.user + ':offerings', id, id);
//       // global Offerings set
//       db.zadd('offerings', id, id);
//       self.update(fn);
//     });
//   }
// };

// Offering.prototype.update = function(fn){
//   db.set('offering:id:' + this.name, this.id);
//   db.hmset('offering:' + this.id, this, fn);
// };

// Offering.prototype.remove = function(fn){
//   db.multi()
//     // remove the id-name index
//     .del('offering:id:' + this.name)
//     // remove the Offering hash
//     .del('offering:' + this.id)
//     // remove it from the user's set
//     .zrem('user:' + this.user + ':offerings', this.id)
//     // remove it from the global set
//     .zrem('offerings', this.id)
//     .exec(fn);
// };

// Offering.get = function(id, fn){
//   db.hgetall('offering:' + id, function(err, offering){
//     if (err) return fn(err);
//     fn(null, new Offering(offering));
//   });
// };

// Offering.getRange = function(from, to, fn){
//   db.zrange('offerings', from, to, function(err, ids){
//     if (err) return fn(err);
//     var pending = ids.length
//       , offerings = []
//       , done;

//     if (!pending) return fn(null, []);

//     ids.forEach(function(id){
//       offering.get(id, function(err, offering){
//         if (done) return;

//         if (err) {
//           done = true;
//           return fn(err);
//         }

//         offerings.push(offering);
//         --pending || fn(null, offerings);
//       });
//     });
//   });
// };

// Offering.count = function(fn){
//   db.zcard('offerings', fn);
// };