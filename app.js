const express = require("express");
const app = express();

app.listen(8080);
app.set("views", "./views");
app.set("view engine", "pug");
app.get("/", (req, res) => {
  res.render("index", { title: "Hey", message: "Hello there!" });
});
