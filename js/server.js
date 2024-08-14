const apiUrl = 'http://172.233.246.192:3000';

//region GLOBAL VARIABLES
let gameId = null;
//endregion

//region TEST CONNECTION
/*const xhr = new XMLHttpRequest();

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
xhr.send();*/
//endregion

//region FUNCTIONS
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

function joinGame() {
  const xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        gameId = parseInt(xhr.responseText);
        document.querySelector("#game_id").innerText = gameId;
      } else {
        console.error(`HTTP request failed with status ${xhr.status}`);
      }
    }
  };

  xhr.open('GET', apiUrl + `/joingame?name=${localStorage.getItem('clientId')}`, true);
  xhr.send();
}

function setReady() {

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

//region START
if (!localStorage.getItem('clientId')) {
  localStorage.setItem('clientId', uuidv4());
}
document.querySelector("#uuid").innerText = localStorage.getItem('clientId');

joinGame();

getGames();
//endregion