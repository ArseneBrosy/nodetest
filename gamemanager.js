const CARDS = [
  {
    en_us: "Ammo",
    fr_fr: "Munition",
    priority: 0,
    cost: 0,
    play: (player) => {
      player.munitions++;
    }
  }
];

function play(game) {
  // reset
  game.timer = 90;
  for (let player of game.players) {
    player.played = false;
  }
  // sort players by priority
  game.players.sort((a, b) => {return CARDS[a.choosedCard].priority - CARDS[b.choosedCard].priority});
  // play
  for (let player of game.players) {
    CARDS[player.choosedCard].play(player);
  }
}

module.exports = {
  play
};