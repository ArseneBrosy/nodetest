// Connect to the WebSocket server
const socket = new WebSocket('ws://172.233.246.192:8080');

//region FUNCTIONS
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

function joinGame() {
  socket.send(JSON.stringify({
    request: 'joinGame',
    name: localStorage.getItem('clientId')
  }));
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
  console.log('Message from server:', event.data);
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