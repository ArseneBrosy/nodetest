const apiUrl = 'http://172.233.246.192:3000';

//region GLOBAL VARIABLES
let gameId = null;
//endregion

//region TEST CONNECTION
const xhr = new XMLHttpRequest();

xhr.onreadystatechange = function () {
  if (xhr.readyState === XMLHttpRequest.DONE) {
    if (xhr.status === 200) {
      console.log(xhr.responseText);
    } else {
      console.error(`HTTP request failed with status ${xhr.status}`);
    }
  }
};

xhr.open('GET', apiUrl + "/testconnection", true);
xhr.send();
//endregion

//region FUNCTIONS
function joinGame() {
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        gameId = parseInt(xhr.responseText);
        console.log(`joined game ${gameId}`);
      } else {
        console.error(`HTTP request failed with status ${xhr.status}`);
      }
    }
  };

  xhr.open('GET', apiUrl + "/joingame", true);
  xhr.send();
}

function getGames() {
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        console.table(JSON.parse(xhr.responseText));
      } else {
        console.error(`HTTP request failed with status ${xhr.status}`);
      }
    }
  };

  xhr.open('GET', apiUrl + "/getgames", true);
  xhr.send();
}
//endregion

joinGame();

getGames();