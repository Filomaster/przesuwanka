// Create game area

const container = document.getElementById("container");
const clock = document.getElementById("clock");
let COUNT = 3; // Elements count (temp) - this should be dynamic
let SIZE = 500; // Size of the container
let TILE_SIZE = parseInt(SIZE / COUNT);
const IS_DEV = false;
let timer, mix;
let startTime, currentTime;
// Images for game
const images = [
  "../images/playable/image_1.jpg",
  "../images/playable/image_2.jpg",
  "../images/playable/image_3.jpg",
];

// Timer digits
const digits = [
  "../images/digits/nixie_0.png",
  "../images/digits/nixie_1.png",
  "../images/digits/nixie_2.png",
  "../images/digits/nixie_3.png",
  "../images/digits/nixie_4.png",
  "../images/digits/nixie_5.png",
  "../images/digits/nixie_6.png",
  "../images/digits/nixie_7.png",
  "../images/digits/nixie_8.png",
  "../images/digits/nixie_9.png",
  "../images/digits/nixie_dot.png",
];

const neighbors = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

let imageIndex = 0;
let playerBoard = [];

let preview = document.getElementById("preview");
preview.style.cssText = `background-image: url(${images[imageIndex]}); background-size: 50px; height: 50px; width: 50px`;
container.style.cssText = `width: ${SIZE}px; height: ${SIZE}px`;

initClock = () => {
  for (let i = 0; i < 12; i++) {
    let digit = document.createElement("p");
    digit.className = "digit";
    clock.appendChild(digit);
  }
};

formatTime = (time) => {
  date = new Date(time);
  return `${date.getHours() - 1 < 10 ? "0" : ""}${date.getHours() - 1}:${
    date.getMinutes() < 10 ? "0" : ""
  }${date.getMinutes()}:${
    date.getSeconds() < 10 ? "0" : ""
  }${date.getSeconds()}:${
    date.getMilliseconds() < 10 ? "00" : date.getMilliseconds() < 100 ? "0" : ""
  }${date.getMilliseconds()}`;
};

drawClock = (time) => {
  // time format hh.mm.ss.mmm
  for (let i = 0; i < time.length; i++) {
    if (time[i] === ":") {
      clock.children[i].style.backgroundImage = `url(${digits[10]})`;
      continue;
    }
    clock.children[i].style.backgroundImage = `url(${
      digits[parseInt(time[i])]
    })`;
  }
};

createGameBoard = (size) => {
  let board = [];
  let id = 0;
  for (let i = 0; i < size; i++) {
    let row = [];
    for (let j = 0; j < size; j++) {
      row.push(id != size ** 2 - 1 ? id : "empty");
      id++;
    }
    board.push(row);
  }
  return board;
};

checkOrder = (board) => {
  let numbers = [].concat(...board);
  numbers.pop(0); // TODO: Nie zostawiaj 'pop' bo nie zadziała kiedy empty nie jest na końcu... Znaczy teoretycznie zadziała ale nie jak powinno
  for (let i = 0; i < numbers.length - 1; i++) {
    if (numbers[i] + 1 != numbers[i + 1]) return false;
  }
  return true;
};

// TODO: Check if tile is near empty
checkMove = (tile, board) => {
  let x = parseInt(tile.dataset.x);
  let y = parseInt(tile.dataset.y);
  let safeBoard = [];
  for (let i = 0; i < board.length + 2; i++) {
    let row = [];
    for (let j = 0; j < board.length + 2; j++) {
      if (i == 0 || i == board.length + 1 || j == 0 || j == board.length + 1)
        row.push(".");
      else row.push(board[i - 1][j - 1]);
    }
    safeBoard.push(row);
  }
  //   debugBoard(safeBoard);

  for (let i = 0; i < neighbors.length; i++) {
    if (
      safeBoard[y + 1 + neighbors[i][0]][x + 1 + neighbors[i][1]] === "empty"
    ) {
      return { x: x + neighbors[i][1], y: y + neighbors[i][0] };
    }
  }
  return false;
};

// Funkcja zapożyczona w celu wygodniejszego losowania liczb.
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// !Possible inside TILE object
moveTile = (tile, board) => {
  let moved = checkMove(tile, board);
  if (moved != false) {
    tile.parentNode.childNodes.forEach((sibling) => {
      if (sibling.dataset.x == moved.x && sibling.dataset.y == moved.y) {
        //   Switch id in board
        let switchId = board[tile.dataset.y][tile.dataset.x];
        board[tile.dataset.y][tile.dataset.x] =
          board[sibling.dataset.y][sibling.dataset.x];
        board[sibling.dataset.y][sibling.dataset.x] = switchId;
        // Switch x,y
        sibling.dataset.x = tile.dataset.x;
        sibling.dataset.y = tile.dataset.y;
        tile.dataset.x = moved.x;
        tile.dataset.y = moved.y;
        //   Change style
        sibling.style.left =
          sibling.dataset.x * TILE_SIZE /*+ sibling.dataset.x */ + "px";
        sibling.style.top =
          sibling.dataset.y * TILE_SIZE /*+ sibling.dataset.y */ + "px";
        tile.style.left =
          tile.dataset.x * TILE_SIZE /*+ tile.dataset.x */ + "px";
        tile.style.top =
          tile.dataset.y * TILE_SIZE /*+ tile.dataset.y */ + "px";
      }
    });
  }
};

shuffle = (times) => {
  return new Promise((res, rej) => {
    let repeat = getRandomInt(10, 50);
    mix = setInterval(() => {
      container.childNodes.forEach((tile) => {
        moveTile(tile, playerBoard);
      });
      repeat--;
      if (repeat == 0) {
        clearInterval(mix), res();
      }
    }, 5);
  });
};

drawBoard = (board) => {
  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board.length; y++) {
      // ! Possible in TILE object
      let tile = document.createElement("div");
      let style = `
        height: ${TILE_SIZE}px;
        width: ${TILE_SIZE}px;
        left: ${x * TILE_SIZE}px;
        top: ${y * TILE_SIZE}px;
        background-image: url(${images[imageIndex]});
        background-size: ${SIZE}px;
        background-position: ${-x * TILE_SIZE}px ${-y * TILE_SIZE}px;
        scale: 95%;

    `;
      tile.classList.add("tile");
      tile.classList.add("selectable");
      tile.innerHTML = IS_DEV && board[y][x] != "empty" ? board[y][x] + 1 : "";
      if (board[x][y] == "empty") {
        tile.classList.add("hide-bcg");
      }
      tile.style.cssText = style;
      tile.dataset.x = x;
      tile.dataset.y = y;
      tile.dataset.id = board[y][x] + 1;

      tile.addEventListener("mouseover", function () {
        if (checkMove(this, board)) this.style.scale = "90%";
      });
      tile.addEventListener("mouseleave", function () {
        this.style.scale = "95%";
      });
      //   Event listeners
      tile.addEventListener("click", function () {
        moveTile(this, board);
        if (checkOrder(board)) {
          this.parentElement.childNodes.forEach((element) => {
            let finishedTile = element.cloneNode(true);
            finishedTile.style.scale = "100%";
            finishedTile.innerHTML = "";
            finishedTile.classList.remove("selectable");
            finishedTile.classList.remove("hide-bcg");
            element.parentElement.replaceChild(finishedTile, element);
          });
          clearInterval(timer);
          alert(currentTime + "\nU won");
        }
      });
      container.appendChild(tile);
    }
  }
};

// Debugging function. Prints whole table to console in readable way
function debugBoard(gameField) {
  let print = "";
  for (let i = 0; i < gameField.length; i++) {
    for (let j = 0; j < gameField.length; j++) {
      print +=
        (gameField[i][j].toString().length == 1 || gameField[i][j] == "empty"
          ? " "
          : "") +
        (parseInt(gameField[i][j]) || gameField[i][j] == 0
          ? gameField[i][j] + 1
          : gameField[i][j] == "empty"
          ? "E"
          : gameField[i][j]) +
        " ";
    }
    print += "\n";
  }
  console.log(`%c${print}`, "color : #b8ffe6");
}

initClock();
start = () => {
  if (timer) clearInterval(timer);
  container.innerHTML = "";
  TILE_SIZE = SIZE / COUNT;
  playerBoard = createGameBoard(COUNT);
  drawBoard(playerBoard);
  shuffle(100).then(() => {
    startTime = new Date();
    timer = setInterval(() => {
      currentTime = formatTime(Date.now() - startTime.getTime());
      drawClock(currentTime);
    }, 1);
  });
};

let drawScene = () => {
  clearInterval(timer);
  clearInterval(mix);
  container.innerHTML = "";
  drawClock("00:00:00:000");
  TILE_SIZE = SIZE / COUNT;
  drawBoard(createGameBoard(COUNT));
};

// Buttons control
setImageIndex = (add = 1) => {
  imageIndex += add;
  if (imageIndex < 0) imageIndex = images.length - 1;
  if (imageIndex > images.length - 1) imageIndex = 0;
  console.log(imageIndex);
  preview.style.backgroundImage = `url(${images[imageIndex]})`;

  drawScene();
};

// Run our code
drawScene();
