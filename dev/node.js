const express = require("express");
const Blockchain = require("./blockchain");
const parser = require("body-parser");
const port = process.argv[2];

const CryptCoin = new Blockchain();

const app = express();

app.use(parser.json());
app.use(parser.urlencoded({ extended: false }));

//returns the full blockchain
app.get("/blockchain", (req, res) => {
  res.send(CryptCoin);
});

//post a new transaction to the mempool
app.post("/transaction", (req, res) => {
  const { amount, sender, receiver } = req.body;
  const blockOfTransaction = CryptCoin.createNewTransaction(
    amount,
    sender,
    receiver
  );
  res.send({
    msg: `Your transaction of ${amount} cryptcoins are in pending state and will be included in next block of number ${blockOfTransaction}`,
  });
});

//mine a new block in our blockchain
app.get("/mine", (req, res) => {
  const blockData = {
    data: CryptCoin.mempool,
    index: CryptCoin.getLastBlock().index,
  };
  const nonce = CryptCoin.proofOfWork(CryptCoin.getLastBlock().hash, blockData);
  const hashOfThisBlock = CryptCoin.hashBlock(
    CryptCoin.getLastBlock().hash,
    blockData,
    nonce
  );
  const blockedMined = CryptCoin.createNewBlock(
    nonce,
    CryptCoin.getLastBlock().hash,
    hashOfThisBlock
  );
  res.send(blockedMined);
});

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
