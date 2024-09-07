/**
 * Server side script that manage connections with clients
 * @author Arsène Brosy
 * @since 13.08.2024
 */

const WebSocket = require('ws');
const lodash = require('lodash');
const gamemanager = require('./gamemanager');
const wss = new WebSocket.Server({ port: 8080 });

//region GLOBAL VARIABLES
let ongoingGames = [];
let nextFreeGameId = 0;
//endregion

const GameStatus = {
  WAITING : 0,
  FOUND_OPPONENT: 1,
  CHOOSING : 2,
  REVEAL: 3,
  ROUND_END : 4,
  GAME_END : 5
}

//region FUNCTIONS
/**
 * Create a new player object
 * @param ws websocket connection with the player's machine
 * @param uuid uuid associated with the player's machine
 * @returns {{ready: boolean, ws, uuid}} the player object
 */
function newPlayer(ws, uuid) {
  return {
    ws: ws,
    uuid: uuid,
    choosedCard: null,
    played: false,
    munitions: 0,
    protectionLevel: 0
  }
}

/**
 * Create a new game object
 * @param playerWs websocket connection with the first player's machine
 * @param playerUuid uuid associated with the first player's machine
 * @returns {{players: {ready: boolean, ws, uuid}[], id: number}} the game object
 */
function newGame(playerWs, playerUuid) {
  return {
    players: [newPlayer(playerWs, playerUuid)],
    id: nextFreeGameId,
    status: GameStatus.WAITING,
    timer: 90
  }
}

/**
 * Put the player who asked in a free game or create one
 * @param ws websocket connection with the player's machine
 * @param uuid uuid associated with the player's machine
 */
function joinGame(ws, uuid) {
  for (let game of ongoingGames) {
    // check if this name is already in this game
    for (let player of game.players) {
      if (player.uuid === uuid) {
        // update ws
        player.ws = ws;
        // send confirmation
        ws.send(JSON.stringify({
          request: 'joinConfirmation',
          game: getSendableGameObject(game)
        }));
        // ask the players to reload their game
        askToReload(game);
        return;
      }
    }
    // check if this game has a free spot
    if (game.players.length < 2) {
      // add player
      game.players.push(newPlayer(ws, uuid));
      // send confirmation
      ws.send(JSON.stringify({
        request: 'joinConfirmation',
        game: getSendableGameObject(game)
      }));
      // start the game since there is now 2 players
      game.status = GameStatus.PLAYING;
      askToReload(game);
      startGame(game);
      return;
    }
  }

  // create a new game
  let game_ = newGame(ws, uuid);
  ongoingGames.push(game_);
  // send confirmation
  ws.send(JSON.stringify({
    request: 'joinConfirmation',
    game: getSendableGameObject(game_)
  }));
  // ask the players to reload their game
  askToReload(game_);
  // update next free game ID
  nextFreeGameId++;
  return;
}

/**
 * Change the played state of the player who asked
 * @param ws websocket connection with the player's machine
 * @param uuid uuid associated with the player's machine
 * @param gameId game id of the game the player is in
 */
function setPlayed(ws, uuid, gameId, played, cardId) {
    const game = ongoingGames.filter(e => e.id === gameId)[0];
    const player = game.players.filter(e => e.uuid === uuid)[0]
    player.played = played;
    player.choosedCard = cardId;
    // check if both players have played
    if (game.players.length === 2) {
      let bothPlayed = true;
      for (let player_ of game.players) {
        if (!player_.played) {
          bothPlayed = false;
        }
      }
      if (bothPlayed) {
        play(game);
      }
    }
    askToReload(game);
}

/**
 * Transform a game object to keep only properties that matters to the client
 * @param game the game object to transform
 * @returns {*} the transformed game object
 */
function getSendableGameObject(game) {
  let sendable = lodash.cloneDeep(game);
  for (let player of sendable.players) {
    delete player.ws;
    delete player.choosedCard;
  }
  return sendable;
}

/**
 * Send a request to reload their game state to all players of a game
 * @param game the game to reload
 */
function askToReload(game) {
  for (let player of game.players) {
    player.ws.send(JSON.stringify({
      request: 'reloadGame',
      gameState: getSendableGameObject(game)
    }));
  }
}

/**
 * Start a game and send a request to the players to infom them than the game started
 * @param game the game to start
 */
function startGame(game) {
  game.status = GameStatus.FOUND_OPPONENT;
  askToReload(game);

  setTimeout(() => {
    game.status = GameStatus.CHOOSING;
    askToReload(game);

    setInterval(() => {
      game.timer --;
      for (let player of game.players) {
        player.ws.send(JSON.stringify({
          request: 'updateTimer',
          timer: game.timer
        }));
      }
    }, 1000);
  }, 1500);
}

/**
 * play an affrontement between the 2 card of the players of a game
 * @param game the game
 */
function play(game) {
  gamemanager.play(game);
  askToReload(game);
}
//endregion

//region WEBSOCKET
wss.on('connection', function connection(ws) {
  // Listen for messages from the client
  ws.on('message', function incoming(message) {
    // try to parse the message as JSON
    let JSONMessage = null;
    try {
      JSONMessage = JSON.parse(message);
      console.log('received:', JSONMessage);
    } catch (e) {
      console.log(`recivied non JSON: "${message.toString()}"`);
    }

    // actions
    if (JSONMessage !== null) {
      const request = JSONMessage.request;

      switch (request) {
        case 'joinGame': joinGame(ws, JSONMessage.uuid); break;
        case 'setPlayed': setPlayed(ws, JSONMessage.uuid, JSONMessage.gameId, JSONMessage.played, JSONMessage.cardId); break;
      }
    }
  });

  // Handle connection close
  ws.on('close', () => {
    console.log('Client has disconnected');
  });
});
//endregion

setInterval(() => {
  for (let game of ongoingGames) {
    let gameGoing = false;
    for (let player of game.players) {
      if (player.ws.readyState === WebSocket.OPEN) {
        gameGoing = true;
      }
    }
    if (!gameGoing) {
      ongoingGames.splice(ongoingGames.findIndex(item => item.id === game.id), 1)
    }
  }
}, 1000);

console.log('WebSocket server is listening on ws://localhost:8080');
