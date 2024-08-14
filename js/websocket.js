// Connect to the WebSocket server
const socket = new WebSocket('ws://172.233.246.192:8080');

//region GLOBAL VARIABLES
let joinedGame = null;
//endregion

//region FUNCTIONS
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

function joinGame() {
  socket.send(JSON.stringify({
    request: 'joinGame',
    uuid: localStorage.getItem('clientId')
  }));
}

function reloadGameState(gameState) {
  // update joined game
  joinedGame = gameState;

  // ID
  document.querySelector("#game_id").innerText = joinedGame.id;

  // READY
  for (let player of joinedGame.players) {
    if (player.uuid === localStorage.getItem('clientId')) {
      document.querySelector("#me").innerText = player.ready ? "READY" : "NOT READY";
    } else {
      document.querySelector("#opponent").innerText = player.ready ? "READY" : "NOT READY";
    }
  }

  if (joinedGame.players.length < 2) {
    document.querySelector("#opponent").innerText = "NOBODY";
  }
}

function me() {
  return joinedGame.players.filter(e => e.uuid === localStorage.getItem('clientId'))[0];
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

document.querySelector("#ready_button").addEventListener('click', (e) => {
  socket.send(JSON.stringify({
    request: 'setReady',
    uuid: localStorage.getItem('clientId'),
    gameId: joinedGame.id,
    ready: !me().ready
  }));
});
