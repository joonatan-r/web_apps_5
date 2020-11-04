const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GameStatusSchema = new Schema({
  xs: [{ i: Number, j: Number }],
  os: [{ i: Number, j: Number }],
  turn: { type: String },
  gameOver: { type: Boolean }
});

module.exports = mongoose.model("GameStatus", GameStatusSchema);
