require("dotenv").config();

const express = require("express");
const API_handler = require("./youtube_handler");
const bodyParser = require("body-parser");

const app = express();

const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", API_handler);

app.get("/", (req, res) => {
  res.send("Hallo Word");
});

app.listen(PORT, () => {
  console.log(`Youtube API is running on port ${PORT}`);
});
