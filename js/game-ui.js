const myCard = document.querySelector("#playing_me_card");
let mouseX = 0;
let mouseY = 0;
let mouseStartX = 0;
let mouseStartY = 0;
let offsetX = 0;
let offsetY = 0;
let moving = false;
let played = false;
let lastPlayed = false;

const PLAYED_HEIGHT = document.querySelector("body").clientHeight * .2;

myCard.addEventListener("mousedown", () => {
  mouseStartX = mouseX;
  mouseStartY = mouseY;
  moving = true;
  myCard.style.transition = "50ms";
});

document.addEventListener("mouseup", () => {
  moving = false;
  const downDis = Math.sqrt(offsetX ** 2 + offsetY ** 2);
  const upDis = Math.sqrt(offsetX ** 2 + (offsetY + PLAYED_HEIGHT) ** 2);
  played = upDis < downDis;
  myCard.style.transform = `translate(0px, ${played ? -PLAYED_HEIGHT : 0}px)`;
  myCard.style.transition = "200ms";
  if (played !== lastPlayed) {
    setPlayed(played);
  }
  lastPlayed = played;
});

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (moving) {
    offsetX = mouseX - mouseStartX;
    offsetY = mouseY - mouseStartY - (played ? PLAYED_HEIGHT : 0);
    myCard.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }
});