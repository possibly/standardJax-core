const systems = require('./systems.js');
const core = require('./core.js');
const EventEmitter = require('events').EventEmitter;

function StandardJax(){
  this.entities = [];
  this.emitter = new EventEmitter();
  this.api = ['move', 'exchange', 'gather'];
  this.worldSize = [100,100];
}

StandardJax.prototype.tick = function(){
  this.entities = core.applySystems(this.entities, systems);
  return this.entities;
}

StandardJax.prototype.addEntity = function( uuid ){
  this.entities = core.createEntity( this.entities, uuid );
  const row = Math.floor((Math.random() * this.worldSize[0]) + 1);
  const col = Math.floor((Math.random() * this.worldSize[1]) + 1);
  var pos = core.createComponent('position', [row, col]);
  var apples = core.createComponent( 'apples', 0 );
  this.entities = core.applyComponents( this.entities, e => {return e.id === uuid}, [pos, apples] );
}

StandardJax.prototype.trigger = function( uuid, input ){
  const action = _wellFormed( this.api, input.split(' ') );

  //Input has been received for one entity, but this action may require
  //another players immediate action. events[0] is the current entities
  //component, while events[1] is the input the other player should receive.
  const events = _getComponentByAction( this.entities, action );
  this.entities = core.applyComponents( this.entities, e => {return e.id === uuid}, [events[0]] );

  if ( events[1] ){ emitter.emit(events[1].message, events[1].value); } //notify other player that input it required.

  return this.entities;
}

StandardJax.prototype.setComponent = function( uuid, cName, cValue ){
  //TODO: option to set component for specific entity (uuid), or class (type).
  this.entities = this.entities.map( e => {
    if ( e.id === uuid ){ e[cName] = cValue; }
    return e;
  });
}

StandardJax.prototype.getComponents = function( uuid ){
  var e = {};
  var uniqueEntity = _idToEntity( this.entities, uuid );
  for (var i = 0; i < Object.keys( uniqueEntity ).length; i++ ){
    e[ Object.keys(uniqueEntity)[i] ] = uniqueEntity[ Object.keys(uniqueEntity)[i] ];
  }
  return e;
}

function _wellFormed( api, input ){
  if ( api.find( action => action === input[0] ) ){ return input }
  else{
    throw new Error( 'This input was not well formed.' );
  }
}

function _getComponentByAction( entities, action ){
  var moreInput = null;
  var decision = null;

  if ( action[0] === 'move' ){ 
    decision = core.createComponent('direction', action[1]); 
  }

  else if ( action[0] === 'exchange' ){ //api: ['exchange', myAction, otherPlayersId] 
    decision = core.createComponent('exchange', [action[1], action[2]]); 

    const exchangeWithEnt = _idToEntity( entities, action[2] );
    if ( !exchangeWithEnt.hasOwnProperty('exchange') ){ //TODO: validate that both players want to exchange with each other.
      moreInput = {message: 'exchange', value: exchangeWithEnt.id}; //emit id of entity who needs to react still.
    }
  }

  else if ( action[0] === 'gather' ){
    decision = core.createComponent('gather', true); 
  }

  else{
    throw new Error( 'This action has not been implemented yet.' );
  }

  return [decision, moreInput];
}

function _idToEntity( entities, entId ){
  var ent = entities.find( e => {return e.id == entId} );
  
  if ( ent ){ return ent; } 
  else { throw new Error( "No entity with the id '"+entId+"'" ); };
}

module.exports = new StandardJax();