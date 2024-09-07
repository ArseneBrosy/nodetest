const CARDS = [
  {
    en_us: "Ammo",
    fr_fr: "Munition",
    priority: 0,
    cost: 0,
    play: (player, opponent) => {
      player.munitions++;
    }
  },
  {
    en_us: "Sheild",
    fr_fr: "Bouclier",
    priority: 1,
    cost: 0,
    play: (player, opponent) => {
      player.protectionLevel = 1;
    }
  },
  {
    en_us: "Gun",
    fr_fr: "Pistolet",
    priority: 2,
    cost: 1,
    play: (player, opponent) => {
      shoot(opponent, 1);
    }
  },
];

function shoot(player, power) {
  if (player.protectionLevel < power) {
    endGame();
  }
}

function endGame() {
  console.log("END GAME");
}

function play(game) {
  // reset
  game.timer = 90;
  for (let player of game.players) {
    player.played = false;
  }

  // sort players by priority
  game.players.sort((a, b) => {return CARDS[a.choosedCard].priority - CARDS[b.choosedCard].priority});

  // play
  for (let i = 0; i < game.players.length; i++) {
    const player = game.players[i];
    const opponent = game.players[1 - i];
    const card = CARDS[player.choosedCard];
    if (card.cost <= player.munitions) {
      card.play(player, opponent);
      player.munitions -= card.cost;
    }
  }

  // countdowns
  for (let player of game.players) {
    player.protectionLevel = 0;
  }
}

module.exports = {
  play
};