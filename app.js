const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();
const app = express();
const BOARD_SIZE = 5;
const board = [];
let turn = "x";
let gameOver = false;

for (let i = 0; i < BOARD_SIZE; i++) {
  board.push([]);

  for (let j = 0; j < BOARD_SIZE; j++) {
    board[i].push([]);
    board[i][j] = "";
  }
}

function checkRow(row) {
  for (let i = 1; i < row.length; i++) {
    if (row[i - 1] !== row[i] || row[i] === "") return false;
  }
  return true;
}

function checkForWin() {
  let tempRow = null,
    prevRow = null,
    prevRowForColCheck = null,
    diagIdxLeft = 0,
    diagIdxRight = board.length - 1,
    equalOnDiagLeft = true,
    equalOnDiagRight = true;

  for (let row of board) {
    if (checkRow(row)) return true;

    // handle column checking

    if (!prevRowForColCheck) {
      prevRowForColCheck = row;
    } else {
      tempRow = [];

      for (let i = 0; i < row.length; i++) {
        tempRow.push(
          prevRowForColCheck[i] === row[i] && row[i] !== "" ? row[i] : null
        );
      }
      prevRowForColCheck = tempRow;
    }

    // handle left diagonal checking

    if (
      row[diagIdxLeft] === "" ||
      (diagIdxLeft !== 0 && row[diagIdxLeft] !== prevRow[diagIdxLeft - 1])
    ) {
      equalOnDiagLeft = false;
    }

    // handle right diagonal checking

    if (
      row[diagIdxRight] === "" ||
      (diagIdxRight !== board.length - 1 &&
        row[diagIdxRight] !== prevRow[diagIdxRight + 1])
    ) {
      equalOnDiagRight = false;
    }

    // finalize iteration

    prevRow = row;
    diagIdxLeft++;
    diagIdxRight--;
  }
  for (let cell of prevRowForColCheck) {
    if (cell !== null) return true;
  }
  if (equalOnDiagLeft) return true;
  if (equalOnDiagRight) return true;

  return false;
}

app.listen(8080);
app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.render("index", {
    board: board,
    turn: turn,
    gameOver: gameOver
  });
});
app.post("/send_board", upload.array(), (req, res) => {
  board[req.body.i][req.body.j] = turn;
  gameOver = checkForWin();

  if (gameOver) {
    res.render("index", {
      board: board,
      turn: turn,
      gameOver: gameOver
    });
    return;
  }
  turn = turn === "x" ? "o" : "x";
});
