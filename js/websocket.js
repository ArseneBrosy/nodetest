/**
 * Client side script that manage connections with the server
 * @author Arsène Brosy
 * @since 13.08.2024
 */

// Connect to the WebSocket server
const socket = new WebSocket('ws://172.233.246.192:8080');

//region GLOBAL VARIABLES
let joinedGame = null;
let foundOpponentCountdown = 3;
//endregion

//region FUNCTIONS
/**
 * Generate a uuid v4
 * @returns {string} the uuid v4
 */
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

/**
 * Ask the server to put me in a game
 */
function joinGame() {
  socket.send(JSON.stringify({
    request: 'joinGame',
    uuid: localStorage.getItem('clientId')
  }));
}

/**
 * Reload the game state and refresh displayed information
 * @param gameState
 */
function reloadGameState(gameState) {
  // update joined game
  joinedGame = gameState;

  // STATUS
  switch (joinedGame.status) {
    case 0:
      document.querySelector("#searching").style.display = "flex";
      document.querySelector("#found_opponent").style.display = "none";
      document.querySelector("#playing").style.display = "none";
      break;
    case 1:
      document.querySelector("#searching").style.display = "none";
      document.querySelector("#found_opponent").style.display = "flex";
      document.querySelector("#playing").style.display = "none";
      break;
    case 2:
      document.querySelector("#searching").style.display = "none";
      document.querySelector("#found_opponent").style.display = "none";
      document.querySelector("#playing").style.display = "flex";
      // INIT DECK
      initDeck();
      break;
  }

  // OPPONENT
  document.querySelector("#found_opponent_name").innerText = opponent().uuid;

  // TIMER
  document.querySelector("#playing_timer").innerText = secondsToText(joinedGame.timer);

  // PLAYED
  played = me().played;
  document.querySelector("#playing_me_card").style.transform = `translate(0px, ${played ? -PLAYED_HEIGHT : 0}px)`;
  document.querySelector("#playing_opponent_card").style.top = opponent().played ? "7vh" : "-15vh";
  cardName.style.display = played ? "none" : "block";

  // MUNITIONS
  document.querySelector("#playing_me_munitions").innerText = me().munitions;
  document.querySelector("#playing_opponent_munitions").innerText = opponent().munitions;
}

function me() {
  return joinedGame.players.filter(e => e.uuid === localStorage.getItem('clientId'))[0];
}

function opponent() {
  return joinedGame.players.filter(e => e.uuid !== localStorage.getItem('clientId'))[0];
}

function secondsToText(seconds) {
  return `${parseInt(seconds / 60)}:${(seconds % 60 < 10 ? "0" : "") + seconds % 60}`;
}

/**
 * Change the player played state
 * @param played has he played
 * @param id card played by the player
 */
function setPlayed(played, id) {
  socket.send(JSON.stringify({
    request: 'setPlayed',
    uuid: localStorage.getItem('clientId'),
    gameId: joinedGame.id,
    cardId: id,
    played: played
  }));
}
//endregion

//region WEBSOCKET
socket.onopen = function() {
  joinGame();
};

// Event listener for incoming messages
socket.onmessage = function(event) {
  // try to parse the message as JSON
  let JSONMessage = null;
  try {
    JSONMessage = JSON.parse(event.data);
    console.log('received:', JSONMessage);
  } catch (e) {
    console.log(`recivied non JSON: "${event.data}"`);
  }

  // actions
  if (JSONMessage !== null) {
    const request = JSONMessage.request;

    // joinConfirmation
    switch (request) {
      case 'joinConfirmation' : joinedGame = JSONMessage.game; break;
      case 'reloadGame': reloadGameState(JSONMessage.gameState); break;
      case 'updateTimer' :
        joinedGame.timer = JSONMessage.timer;
        document.querySelector("#playing_timer").innerText = secondsToText(joinedGame.timer);
        break;
    }
  }
};

// Event listener for when the connection is closed
socket.onclose = function() {
  console.log('Disconnected from the server');
};

// Event listener for errors
socket.onerror = function(error) {
  console.error('WebSocket error:', error);
};
//endregion

//region START
if (!localStorage.getItem('clientId')) {
  localStorage.setItem('clientId', uuidv4());
}
//endregion
