const myCard = document.querySelector("#playing_me_card");
const deck = document.querySelector("#playing_deck");
const DECK_VELOCITY_FRICTION = 1.1;

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

const PLAYED_HEIGHT = document.querySelector("body").clientHeight * .2;

function startMovingCard(x, y) {
  mouseStartX = x;
  mouseStartY = y;
  movingCard = true;
  myCard.style.transition = "50ms";
}

function startMovingDeck(x) {
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
    setPlayed(played);
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
    deckPosition += deckVelocity;

    // MOVE DECK
    for (let i = 0; i < deck.childElementCount; i++) {
      const deckCard = deck.children[i];
      const boundingRect = deckCard.getBoundingClientRect();
      const xToMiddle = boundingRect.x - window.innerWidth / 2 + boundingRect.width / 2;
      const yPos = (xToMiddle ** 2) * 0.001;
      deckCard.style.transform = `translate(calc(${i*110}% + ${deckPosition}px), ${yPos}px)`;
    }
  }
}, 10);

// INIT DECK
for (let i = 0; i < deck.childElementCount; i++) {
  const deckCard = deck.children[i];
  const boundingRect = deckCard.getBoundingClientRect();
  const xToMiddle = boundingRect.x - window.innerWidth / 2 + boundingRect.width / 2;
  const yPos = (xToMiddle ** 2) * 0.001;
  deckCard.style.transform = `translate(calc(${i*110}%), ${yPos}px)`;
}
