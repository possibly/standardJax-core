var s = require('./lib/standard.js');

s.emitter.on('exchange', function(id){
  s.trigger(1, 'exchange share 0');
});
s.addEntity(0);
s.addEntity(1);
s.trigger(0, 'exchange share 1');
console.log(s.tick());