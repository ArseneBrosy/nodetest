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

  // ID
  document.querySelector("#game_id").innerText = joinedGame.id;
  document.querySelector("#game_status").innerText = joinedGame.status;
}

function me() {
  return joinedGame.players.filter(e => e.uuid === localStorage.getItem('clientId'))[0];
}

function opponent() {
  return joinedGame.players.filter(e => e.uuid !== localStorage.getItem('clientId'))[0];
}

function startGame() {
  document.querySelector("#searching").style.display = "none";
  document.querySelector("#found_opponent").style.display = "block";
  document.querySelector("#found_opponent_name").innerText = opponent().uuid;

  const foundOpponentInterval = setInterval(() => {
    foundOpponentCountdown--;
    document.querySelector("#found_opponent_countdown").innerText = foundOpponentCountdown;
    if (foundOpponentCountdown <= 0) {
      document.querySelector("#found_opponent").style.display = "none";
      document.querySelector("#playing").style.display = "block";
      clearInterval(foundOpponentInterval);
    }
  }, 1000);
}
//endregion

//region WEBSOCKET
socket.onopen = function() {
  console.log('Connected to the server');
  socket.send('Hello, server!');
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
      case 'startGame' : startGame(); break;
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
document.querySelector("#uuid").innerText = localStorage.getItem('clientId');
//endregion
