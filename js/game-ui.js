const myCard = document.querySelector("#playing_me_card");
const deck = document.querySelector("#playing_deck");
const cardName = document.querySelector("#playing_card_name");
const DECK_VELOCITY_FRICTION = 1.1;
const DECK_CURVATURE = 25;
const DECK_CURVATURE_HEIGHT = 120;
const PLAYED_HEIGHT = document.querySelector("body").clientHeight * .25;
const lang = "fr_fr";

let mouseStartX = 0;
let mouseStartY = 0;
let offsetX = 0;
let offsetY = 0;
let movingCard = false;
let movingDeck = false;
let stillMovingDeck = false;
let played = false;
let mouseX = 0;
let lastMouseX = 0;
let deckVelocity = 0;
let deckPosition = 0;
let choosedCard = 0;
let deckInited = false;

let myDeck = [
  {
    id: 0,
    fr_fr: "Munition"
  },
  {
    id: 1,
    fr_fr: "Bouclier"
  },
  {
    id: 2,
    fr_fr: "Pistolet"
  },
]

function startMovingCard(x, y) {
  mouseStartX = x;
  mouseStartY = y;
  movingCard = true;
  myCard.style.transition = "50ms";
}

function startMovingDeck(x) {
  if (played) {
    return;
  }
  mouseX = x;
  lastMouseX = x;
  movingDeck = true;
  stillMovingDeck = true;
}

function clickEnd() {
  if (movingCard) {
    movingCard = false;
    const downDis = Math.sqrt(offsetX ** 2 + offsetY ** 2);
    const upDis = Math.sqrt(offsetX ** 2 + (offsetY + PLAYED_HEIGHT) ** 2);
    played = upDis < downDis;
    myCard.style.transform = `translate(0px, ${played ? -PLAYED_HEIGHT : 0}px)`;
    myCard.style.transition = "200ms";
    setTimeout(() => {
      cardName.style.display = played ? "none" : "block";
    }, 200);
    setPlayed(played, choosedCard);
  }
  if (movingDeck) {
    movingDeck = false;
  }
}

function clickDrag(x, y) {
  if (movingCard) {
    offsetX = x - mouseStartX;
    offsetY = y - mouseStartY - (played ? PLAYED_HEIGHT : 0);
    myCard.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }
  if (movingDeck) {
    mouseX = x;
  }
}

function initDeck() {
  if (deckInited) {
    return;
  }
  deckInited = true;
  for (let i = 0; i < myDeck.length; i++) {
    deck.innerHTML += '<div class="deck-card"></div>';
  }
  const leftBounding = deck.children[0].getBoundingClientRect();
  deckPosition = -leftBounding.x + window.innerWidth / 2 - leftBounding.width / 2;
  placeDeck(deckPosition);
}

function placeDeck(pos) {
  let lastXtoMiddle = Infinity;
  for (let i = 0; i < deck.childElementCount; i++) {
    const deckCard = deck.children[i];
    deckCard.style.transform = `translate(calc(${i*110}% + ${pos}px), 0)`;
    const boundingRect = deckCard.getBoundingClientRect();
    const xToMiddle = (boundingRect.x - window.innerWidth / 2 + boundingRect.width / 2) / window.innerWidth;
    const yPos = (xToMiddle ** 2) * DECK_CURVATURE_HEIGHT;
    const rot = xToMiddle * DECK_CURVATURE;
    deckCard.style.transform = `translate(calc(${i*110}% + ${pos}px), ${yPos}px) rotate(${rot}deg)`;

    // set choosedCard
    if (Math.abs(xToMiddle) < lastXtoMiddle) {
      choosedCard = i;
      cardName.innerText = myDeck[i][lang];
    }
    lastXtoMiddle = Math.abs(xToMiddle);
  }
}

myCard.addEventListener("mousedown", (e) => {
  startMovingCard(e.clientX, e.clientY);
});
myCard.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startMovingCard(e.pageX, e.pageY);
});

deck.addEventListener("mousedown", (e) => {
  startMovingDeck(e.clientX, 0);
});
deck.addEventListener("touchstart", (e) => {
  e.preventDefault();
  startMovingDeck(e.pageX, 0);
});

document.addEventListener("mouseup", clickEnd);
document.addEventListener("touchend", (e) => {
  e.preventDefault();
  clickEnd();
});

document.addEventListener("mousemove", (e) => {
  clickDrag(e.clientX, e.clientY);
});
document.addEventListener("touchmove", (e) => {
  e.preventDefault();
  clickDrag(e.pageX, e.pageY);
});

setInterval(() => {
  if (movingDeck) {
    deckVelocity = mouseX - lastMouseX;
    lastMouseX = mouseX;
  } else if (Math.abs(deckVelocity) > 0.1) {
    deckVelocity /= DECK_VELOCITY_FRICTION;
  } else if (stillMovingDeck) {
    deckVelocity = 0;
    stillMovingDeck = false;
  }
  if (stillMovingDeck) {
    const leftBounding = deck.children[0].getBoundingClientRect();
    const rightBounding = deck.children[deck.childElementCount - 1].getBoundingClientRect();
    const deckLeftLimit = leftBounding.x - window.innerWidth / 2 + leftBounding.width / 2;
    const deckRightLimit = rightBounding.x - window.innerWidth / 2 + rightBounding.width / 2;
    deckPosition += Math.max(Math.min(deckVelocity, -deckLeftLimit), -deckRightLimit);

    // MOVE DECK
    placeDeck(deckPosition);
  }
}, 10);
