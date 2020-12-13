// DOM elements
const container = document.getElementById("container");
const clock = document.getElementById("clock");
const slider = document.getElementById("slider");
const slides = document.getElementById("slides");
const app = document.getElementById("app");

// Variables
let COUNT = 3; // Elements count (temp) - this should be dynamic
let SIZE = 400; // Size of the container
let TILE_SIZE = parseInt(SIZE / COUNT);
const IS_DEV = false;
let timer, mix;
let startTime, currentTime;
let victoryWindow;
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

const places = ["st", "nd", "rd", "th"];
const neighbors = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
];

let leaderboard = {
  scores: [],
  getScores: function (index, mode) {
    return this.scores
      .filter((x) => x.map == index && x.mode == mode)
      .sort(
        (a, b) =>
          parseInt(a.score.replace(":", "")) -
          parseInt(b.score.replace(":", ""))
      );
  },
  checkScore: function (score) {
    let mapScores = this.getScores(imageIndex, COUNT);
    for (let i = 0; i < mapScores.length; i++) {
      if (
        parseInt(score.replaceAll(":", "")) <
        parseInt(mapScores[i].score.replaceAll(":", ""))
      ) {
        return i;
      }
    }
    return null;
  },
  addScores: function (nick, time) {
    let mapScores = this.getScores(imageIndex, COUNT);
    let leaderboardStartIndex = this.scores.indexOf(mapScores[0]);
    console.log(leaderboardStartIndex);
    if (this.checkScore(time) != null) {
      let index = this.checkScore(time);
      mapScores.splice(index, 0, {
        map: imageIndex,
        mode: COUNT,
        place: index + 1,
        nick: nick,
        score: time,
      });
      // console.log(mapScores)
      mapScores.pop();
      for (let i = 0; i < 10; i++) {
        mapScores[i].place = i + 1;
      }
      // console.log(mapScores, leaderboardStartIndex);
      this.scores.splice(leaderboardStartIndex, 10, ...mapScores);
      console.log(this.getScores(imageIndex, COUNT));
    }
  },

  initScores: function () {
    if (this.scores.length == 0) {
      images.forEach((image, index) => {
        for (let i = 3; i <= 6; i++) {
          for (let j = 1; j <= 10; j++) {
            this.scores.push({
              map: index,
              mode: i,
              place: j,
              nick: "---",
              score: "99:99:99:999",
            });
          }
        }
      });
    }
  },
};

let imageIndex = 0;
let playerBoard = [];

class customWindow {
  constructor(width, height, fullHeight = false) {
    this.width = width;
    this.height = height;
    this.fullHeight = fullHeight;
  }

  drawWindow(content) {
    if (window.innerWidth < 1000) {
      this.width = 2 * this.width;
    }
    if (window.innerWidth < 768) {
      this.width = 100;
      if (this.fullHeight) this.height = 100;
    }
    console.log("TEST");
    let customBcg = document.createElement("div");
    customBcg.className = "screenBcg";
    let customWindow = document.createElement("div");
    customWindow.className = "customWindow";
    customWindow.style.width = this.width + "vw";
    customWindow.style.height = this.height + "vh";
    customWindow.style.top =
      parseInt(this.fullHeight ? 0 : 50 - this.height / 2) + "vh";
    customWindow.style.left =
      parseInt(this.width > 100 ? 0 : 50 - this.width / 2) + "vw";
    let button = document.createElement("a");
    button.innerText = "X";
    button.addEventListener("click", function () {
      customBcg.parentElement.removeChild(customBcg);
    });
    // TODO

    customWindow.appendChild(button);
    customWindow.appendChild(content);
    customBcg.appendChild(customWindow);
    this.mainWindow = customBcg;
    app.appendChild(customBcg);
  }
  deleteWindow() {
    this.mainWindow.parentElement.removeChild(this.mainWindow);
  }
}

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

initSlider = (slides) => {
  images.forEach((image) => {
    slide = document.createElement("span");
    slide.style.cssText = `background-image: url(${image})`;
    slide.classList.add("slide");
    slides.appendChild(slide);
  });
};

// initSlider(slides);

// let x = document.createElement("div");
// let testWindow = new customWindow(40, 65);
// x.className = "windowWrapper";
// x.innerHTML = `<h1>You won!</h1><p>Your time: 00:00:00:000</p>
//               <p>You got 2nd best time! Enter your nickname to save it to leaderboard</p>
//               <p>MAX 3 LETTERS</p>
//               <input name="nick" id="nick">
//               <button onclick="testWindow.deleteWindow(); ">Ok</button>`;
// testWindow.drawWindow(x);

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
  for (let i = 0; i < numbers.length - 2; i++) {
    if (numbers[i] + 1 != numbers[i + 1]) return false;
  }
  return true;
};

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
    setTimeout(() => {
      shuffleInterval = (count, timeout) => {
        container.childNodes.forEach((tile) => {
          moveTile(tile, playerBoard);
        });
        if (count <= 0) {
          setTimeout(res, 500);
          return;
        }
        count--;
        if (timeout > 40) timeout -= 20;

        setTimeout(() => {
          shuffleInterval(count, timeout);
        }, timeout);
      };
      let repeat = getRandomInt(10, 100);
      shuffleInterval(repeat, 250);
    }, 500);
  });
};

drawBoard = (board, readOnly = false) => {
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
          let message = document.createElement("div");
          let place = leaderboard.checkScore(currentTime);
          victoryWindow =
            place != null ? new customWindow(40, 65) : new customWindow(40, 30);

          message.className = "windowWrapper";
          message.innerHTML = `<h1>You won!</h1><p>Your time: ${currentTime}</p> ${
            place != null
              ? `<p>You got ${
                  place + 1 + places[place < 3 ? place : 3]
                } best time! Enter your nickname to save it to leaderboard</p>
                <p>MAX 3 LETTERS</p>
                <input name="nick" id="nick" minlength="3" maxlength="3">
                <button onclick="if(document.getElementById('nick').value.length == 3){leaderboard.addScores(document.getElementById('nick').value, currentTime); victoryWindow.deleteWindow()}">Ok</button>`
              : `<button onclick="victoryWindow.deleteWindow()">Ok</button>`
          }`;
          victoryWindow.drawWindow(message);
        }
      });

      container.appendChild(tile);
    }
  }
};

drawBoardReadonly = () => {
  container.childNodes.forEach((element) => {
    let finishedTile = element.cloneNode(true);
    finishedTile.style.scale = "100%";
    finishedTile.innerHTML = "";
    finishedTile.classList.remove("selectable");
    finishedTile.classList.remove("hide-bcg");
    element.parentElement.replaceChild(finishedTile, element);
  });
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
  drawClock("00:00:00:000");
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
  drawBoard(createGameBoard(COUNT), true);
  drawBoardReadonly();
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

// Run our code,
leaderboard.initScores();
drawScene();
