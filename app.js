const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();
const mongoose = require("mongoose");
const GameStatus = require("./models/gameStatus");
const checkForWin = require("./gameUtil");
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

// db set up code from https://bitbucket.org/aknutas/www-express-mongo-demo/src/master/

let mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;

if (mongoURL == null) {
  let mongoHost, mongoPort, mongoDatabase, mongoPassword, mongoUser;
  // If using plane old env vars via service discovery
  if (process.env.DATABASE_SERVICE_NAME) {
    var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    mongoHost = process.env[mongoServiceName + "_SERVICE_HOST"];
    mongoPort = process.env[mongoServiceName + "_SERVICE_PORT"];
    mongoDatabase = process.env[mongoServiceName + "_DATABASE"];
    mongoPassword = process.env[mongoServiceName + "_PASSWORD"];
    mongoUser = process.env[mongoServiceName + "_USER"];

    // If using env vars from secret from service binding
  } else if (process.env.database_name) {
    mongoDatabase = process.env.database_name;
    mongoPassword = process.env.password;
    mongoUser = process.env.username;
    let mongoUriParts = process.env.uri && process.env.uri.split("//");
    if (mongoUriParts.length == 2) {
      mongoUriParts = mongoUriParts[1].split(":");
      if (mongoUriParts && mongoUriParts.length == 2) {
        mongoHost = mongoUriParts[0];
        mongoPort = mongoUriParts[1];
      }
    }
  }

  if (mongoHost && mongoPort && mongoDatabase) {
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ":" + mongoPassword + "@";
    }
    mongoURL += mongoHost + ":" + mongoPort + "/" + mongoDatabase;
  }
}

mongoose.connect(mongoURL);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.listen(8080);
app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  // load status from db

  GameStatus.findOne((err, status) => {
    if (err) return console.error(err);
    turn = status.turn;
    gameOver = status.gameOver;

    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        board[i][j] = "";
      }
    }
    for (let x of status.xs) {
      board[x.i][x.j] = "x";
    }
    for (let o of status.os) {
      board[o.i][o.j] = "o";
    }
  });

  res.render("index", {
    board: board,
    turn: turn,
    gameOver: gameOver
  });
});
app.post("/send_board", upload.array(), (req, res) => {
  board[req.body.i][req.body.j] = turn;
  gameOver = checkForWin(board);

  if (gameOver) {
    res.render("index", {
      board: board,
      turn: turn,
      gameOver: gameOver
    });
    return;
  }
  turn = turn === "x" ? "o" : "x";

  // delete previous status(es) from db

  GameStatus.deleteMany({}, (err) => {
    if (err) return console.error(err);
  });

  // save state to db

  const xs = [];
  const os = [];

  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === "x") {
        xs.push({ i: i, j: j });
      } else if (board[i][j] === "o") {
        os.push({ i: i, j: j });
      }
    }
  }

  const gameStatus = new GameStatus({
    xs: xs,
    os: os,
    turn: turn,
    gameOver: gameOver
  });
  gameStatus.save((err) => {
    if (err) return console.error(err);
  });
});
app.post("/restart", (req, res) => {
  GameStatus.deleteMany({}, (err) => {
    if (err) return console.error(err);
  });
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      board[i][j] = "";
    }
  }
  turn = "x";
  gameOver = false;
  res.render("index", {
    board: board,
    turn: turn,
    gameOver: gameOver
  });
});
