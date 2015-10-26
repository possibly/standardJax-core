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
    if ( e.hasOwnProperty( 'exchange' ) ){
      var exchangeWith = idToEntity( entities, e.exchange[1] ); //{exchange: [ myAction, entId ]}

      const decision = e.exchange[0];
      const withDecision = exchangeWith.exchange[0];

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
        e.apples += 1;
        exchangeWith.apples += 1; 
      }

      delete e.exchange;
      delete exchangeWith.exchange;
      for (var j = 0; j < entities.length; j++ ){ //update array to modify the other entity.
        if (entities[j].id === exchangeWith.id){
          entities[j] = exchangeWith;
          break;
        }
      }
    }

    return e;
  });
}

function idToEntity( entities, entId ){
  var e = entities.find( e => e.id == entId );
  if ( e ){ return e; } 
  else { throw new Error( "No entity with the id '"+entId+"'" ); };
}

function subtractAsManyAs(entNum, sub){
  var sum = Number(entNum) - Number(sub);
  if ( sum < 0 ){ return 0; }
  return sum;
}

module.exports =  [exchange, physics];