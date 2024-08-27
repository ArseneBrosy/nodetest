const myCard = document.querySelector("#playing_me_card");
let mouseStartX = 0;
let mouseStartY = 0;
let offsetX = 0;
let offsetY = 0;
let moving = false;
let played = false;

const PLAYED_HEIGHT = document.querySelector("body").clientHeight * .2;

function clickStart(x, y) {
  mouseStartX = x;
  mouseStartY = y;
  moving = true;
  myCard.style.transition = "50ms";
}

function clickEnd() {
  moving = false;
  const downDis = Math.sqrt(offsetX ** 2 + offsetY ** 2);
  const upDis = Math.sqrt(offsetX ** 2 + (offsetY + PLAYED_HEIGHT) ** 2);
  played = upDis < downDis;
  myCard.style.transform = `translate(0px, ${played ? -PLAYED_HEIGHT : 0}px)`;
  myCard.style.transition = "200ms";
  setPlayed(played);
}

function clickDrag(x, y) {
  if (moving) {
    offsetX = x - mouseStartX;
    offsetY = y - mouseStartY - (played ? PLAYED_HEIGHT : 0);
    myCard.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  }
}

myCard.addEventListener("mousedown", (e) => {
  clickStart(e.clientX, e.clientY);
});
myCard.addEventListener("touchstart", (e) => {
  e.preventDefault();
  clickStart(e.pageX, e.pageY);
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
