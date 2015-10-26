const systems = require('./systems.js');
const core = require('./core.js');
const worldSize = [100, 100];
const api = ['move', 'exchange', 'gather'];
const EventEmitter = require('events').EventEmitter;
const emitter = new EventEmitter();
var entities = [];
var toEmit = []; //[ {message: '', value: ... }, ... ]

function StandardJax(){
  this.trigger = trigger;
  this.tick = tick;
  this.addEntity = addEntity;
  this.emitter = emitter;
}

//modifies global state.
function tick(){
  entities = core.applySystems(entities, systems);
  return entities;
}

//modifies global state
function addEntity( uuid ){
  var entity = entities.find( e => e.id === uuid );
  if (!entity){
    entities = core.createEntity( entities, uuid );
    const row = Math.floor((Math.random() * worldSize[0]) + 1);
    const col = Math.floor((Math.random() * worldSize[1]) + 1);
    var pos = core.createComponent('position', [row, col]);
    var apples = core.createComponent( 'apples', 0 );
    entities = core.applyComponents( entities, e => {return e.id === uuid}, [pos, apples] );
  }
}

//modifies global state
function trigger( uuid, input ){
  const action = wellFormed( api, input.split(' ') );

  //Input has been received for one entity, but this action may require
  //another players immediate action. events[0] is the current entities
  //component, while events[1] is the input the other player should receive.
  const events = getComponentByAction( entities, action );
  entities = core.applyComponents( entities, e => {return e.id === uuid} , [events[0]] );

  if ( events[1] ){ emitter.emit(events[1].message, events[1].value); } //notify other player that input it required.

  return entities;
}

function wellFormed( api, input ){
  if ( api.find( action => action === input[0] ) ){ return input }
  else{
    throw new Error( 'This input was not well formed.' );
  }
}

function getComponentByAction( entities, action ){
  var moreInput = null;
  var decision = null;

  if ( action[0] === 'move' ){ 
    decision = core.createComponent('direction', action[1]); 
  }

  else if ( action[0] === 'exchange' ){ //api: ['exchange', myAction, otherPlayersId] 
    decision = core.createComponent('exchange', [action[1], action[2]]); 

    const exchangeWithEnt = idToEntity( entities, action[2] );
    if ( !exchangeWithEnt.hasOwnProperty('exchange') ){ //TODO: validate that both players want to exchange with each other.
      moreInput = {message: 'exchange', value: exchangeWithEnt.id}; //emit id of entity who needs to react still.
    }
  }

  else if ( action[0] === 'gather' ){
    decision = core.createComponent('gather', [action[1], action[2]]); 
  }

  else{
    throw new Error( 'This action has not been implemented yet.' );
  }

  return [decision, moreInput];
}

function idToEntity( entities, entId ){
  var ent = entities.find( e => {return e.id == entId} );
  
  if ( ent ){ return ent; } 
  else { throw new Error( "No entity with the id '"+entId+"'" ); };
}

module.exports = new StandardJax();