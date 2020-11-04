const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();
const app = express();

const BOARD_SIZE = 5;
const board = [];

for (let i = 0; i < BOARD_SIZE; i++) {
  board.push([]);

  for (let j = 0; j < BOARD_SIZE; j++) {
    board[i].push([]);
    board[i][j] = "";
  }
}

app.listen(8080);
app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.render("index", {
    board: board
  });
});
app.post("/send_board", upload.array(), (req, res) => {
  const i = req.body.i;
  const j = req.body.j;
  board[i][j] = "o";
});
