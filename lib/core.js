function createEntity( entities, uuid ){
  var entity = {}; //consider Object Pooling in the future.
  entity.id = uuid;
  entities.push(entity);
  return entities;
}

function applySystems( entities, systems ){
  return systems.reduce( (ents, s) => s.call(null, ents), entities )
}

function applyComponents( entities, testFn, components ){
  return entities.map( e => {
    if ( testFn( e ) ){
      components.forEach( c => {
        var key = Object.keys(c);
        e[key] = c[key];
      });
    }

    return  e;
  });
}

function createComponent( name, value ){
  var c = {};
  c[name] = value;
  return c;
}

module.exports = {
                    createEntity: createEntity,
                    applySystems: applySystems,
                    applyComponents: applyComponents,
                    createComponent: createComponent
                  }