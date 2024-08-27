const express = require('express');

const app = express();
const port = 3000;

//region GLOBAL VARIABLES
let nextFreeGameId = 0;
//endregion

app.use(express.json());
app.use((req, res, next) => {
  // Enable CORS for all routes
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/testconnection', async (req, res) => {
  try {
    console.log(req.ip + " executed testconnection");
    res.send('connection OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

ongoingGames = [];
app.get('/joingame', async (req, res) => {
  try {
    res.send(joinGame(req.query.name).toString());
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/getgames', async (req, res) => {
  try {
    res.send(JSON.stringify(ongoingGames));
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

//region FUNCTION
function newPlayer(name) {
  return {
    name: name,
    ready: false,
  }
}

function joinGame(name) {
  for (let game of ongoingGames) {
    // check if this name is already in this game
    for (let player of game.players) {
      if (player.name === name) {
        return game.id;
      }
    }
    // check if this game has a free spot
    if (game.players.length < 2) {
      game.players.push(newPlayer(name));
      return game.id;
    }
  }

  // create a new game
  ongoingGames.push({
    players: [newPlayer(name)],
    id: nextFreeGameId
  });
  nextFreeGameId++;
  return nextFreeGameId - 1;
}
//endregion

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
