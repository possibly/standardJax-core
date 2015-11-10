function physics( entities ){
  return entities.map( e => {
    if ( e.hasOwnProperty( 'direction' ) && canMove( entities, e ) ){
      return move( e );
    }

    return e;
  });
}

function move( e ){
  speed = e.speed || 1;
  var newPos = undefined;

  if ( e.direction === 'up' ){ newPos = [e.position[0] - Number(speed), e.position[1]]; }
  else if ( e.direction === 'right' ){ newPos = [e.position[0], e.position[1] + Number(speed)]; }
  else if ( e.direction === 'down' ){ newPos = [e.position[0] + Number(speed), e.position[1]]; }
  else if ( e.direction === 'left' ){ newPos = [e.position[0], e.position[1] - Number(speed)]; }
  else{
    throw new Error( 'This direction is not yet handled.' )
  }

  e.position = newPos;
  delete e.direction;
  return e;
}

function canMove( entities, movingEntity ){
  var newPosition = move( movingEntity ).position;

  return !entities.find( e => {
    return e.hasOwnProperty( 'position' ) && e.position[0] === newPosition[0] && e.position[1] === newPosition[1];
  })
}

function exchange( entities ){
  return entities.map( e => {
    if ( !e.hasOwnProperty( 'exchange') ){ return e; }
    var exchangeWith = idToEntity( entities, e.exchange[1] ); //{exchange: [ myAction, entId ]}

    var decision = e.exchange[0];
    var withDecision = exchangeWith.exchange[0];

    if ( decision === 'steal' && withDecision === 'steal' ){ 
      e.apples = subtractAsManyAs(e.apples, 1); 
      exchangeWith.apples = subtractAsManyAs(exchangeWith.apples, 1); 
    }
    else if ( decision === 'share' && withDecision === 'steal' ){ 
      e.apples = subtractAsManyAs(e, 6); 
      exchangeWith.apples += 6; 
    }
    else if ( decision === 'steal' && withDecision === 'share' ){ 
      e.apples += 6; 
      exchangeWith.apples = subtractAsManyAs(exchangeWith, 6); 
    }
    else if ( decision === 'share' && withDecision === 'share' ){ 
      e.apples += 2;
      exchangeWith.apples += 2; 
    }

    delete e.exchange;
    delete exchangeWith.exchange;
    for (var j = 0; j < entities.length; j++ ){ //update array to modify the other entity.
      if (entities[j].id === exchangeWith.id){
        entities[j] = exchangeWith;
        break;
      }
    }

    return e;
  });
}

function gather( entities ){
  return entities.map( e => {
    if ( !e.hasOwnProperty( 'gather' ) ){ return e; }

    var tree = entities.find( t => t.id === 'tree' && isNeighbour( e, t ) && t.apples > 0 );

    if ( tree ){
      tree.apples -= 1;
      e.apples += 1;
    }

    delete e.gather;

    if ( !tree ){ /* TODO: If there are no tree's around the player, then is attempting to gather an error? */ }

    return e;
  });
}

function isNeighbour( EntOne, EntTwo ){
  return Math.abs(EntOne.position[0] - EntTwo.position[0]) <= 1 && Math.abs(EntOne.position[1] - EntTwo.position[1]) <= 1;
}

function idToEntity( entities, entId ){
  var e = entities.find( e => e.id == entId );
  return e;
}

function subtractAsManyAs(entNum, sub){
  var sum = Number(entNum) - Number(sub);
  if ( sum < 0 ){ return 0; }
  return sum;
}

module.exports =  [exchange, gather, physics];