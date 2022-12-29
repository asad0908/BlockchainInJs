const express = require("express");

const app = express();

//returns the full blockchain
app.get("/blockchain", (req, res) => {});

//post a new transaction to the mempool
app.post("/transaction", (req, res) => {});

//mine a new block in our blockchain
app.get("/mine", (req, res) => {});

app.listen(5000, () => {
  console.log("app is running on port 5000");
});
