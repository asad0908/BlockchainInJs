// MY OWN BLOCKCHAIN!

function Blockchain() {
  this.chain = []; //stores all the blocks (chain of blocks)
  this.mempool = []; //stores all unverified transactions
}

Blockchain.prototype.createNewBlock = (nonce, previousHash, hash) => {
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

Blockchain.prototype.getLastBlock = () => {
  //returns the last block of the chain
  return this.chain[this.chain.length - 1];
};

module.exports = Blockchain;
