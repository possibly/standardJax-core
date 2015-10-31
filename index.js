var s = require('./lib/interface.js');

s.addEntity(0);
console.log(s.getComponents(0));

s.addEntity('tree');
s.addEntity('tree');
s.setComponent('tree', 'not', 'unique');
console.log(s.tick());