// MY OWN BLOCKCHAIN!

const sha256 = require("sha256");

function Blockchain() {
  this.chain = []; //stores all the blocks (chain of blocks)
  this.mempool = []; //stores all unverified transactions

  //genesis block
  this.createNewBlock(786, "0x000000", "0x000000");
}

Blockchain.prototype.createNewBlock = function (nonce, previousHash, hash) {
  //creates a new block
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transactions: this.mempool,
    nonce: nonce,
    previousHash: previousHash,
    hash: hash,
  };

  //empty the mempool area
  this.mempool = [];

  //push the block to the chain
  this.chain.push(newBlock);

  //returns the new block
  return newBlock;
};

Blockchain.prototype.getLastBlock = function () {
  //returns the last block of the chain
  return this.chain[this.chain.length - 1];
};

Blockchain.prototype.createNewTransaction = function (
  amount,
  sender,
  receiver
) {
  //create a new transaction
  const newTransaction = {
    amount: amount,
    sender: sender,
    receiver: receiver,
  };

  //push the transaction to mempool area
  this.mempool.push(newTransaction);

  //returns to which block index this pending transaction will be added to
  return this.getLastBlock().index + 1;
};

Blockchain.prototype.hashBlock = function (
  previousBlockHash,
  currentBlockData,
  nonce
) {
  //takes data from block and hash it with a nonce
  const string =
    previousBlockHash + JSON.stringify(currentBlockData) + nonce.toString();
  const hash = sha256(string);
  return hash;
};

Blockchain.prototype.proofOfWork = function (
  previousBlockHash,
  currentBlockData
) {
  //proof of work method to find the correct nonce
  let nonce = 0;
  let currentHash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  while (currentHash.substring(0, 4) !== "0000") {
    //keep incrementing hash until you find the correct proof of your work.
    nonce++;
    currentHash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  }
  return nonce;
};

module.exports = Blockchain;
