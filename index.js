var s = require('./lib/interface.js');

s.emitter.on('exchange', function(id){
  s.trigger(1, 'exchange share 0');
});
s.addEntity(0);
s.setComponent(0, 'position', [0,0]);
s.addEntity('tree');
s.setComponent('tree', 'apples', 5);
s.setComponent('tree', 'position', [0,0]);
s.trigger(0, 'gather');
console.log(s.tick());