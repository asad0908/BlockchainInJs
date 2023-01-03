// MY OWN BLOCKCHAIN!
const currentNodeUrl = process.argv[3];
const sha256 = require("sha256");

function Blockchain() {
  this.chain = []; //stores all the blocks (chain of blocks)
  this.mempool = []; //stores all unverified transactions
  this.currentNodeUrl = currentNodeUrl; //assigns current node url
  this.networkNodes = []; //stores all nodes associated with our blockchain

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
    transactionId: "0x" + sha256(amount.toString() + sender + receiver),
  };

  //return the transaction obj
  return newTransaction;
};

Blockchain.prototype.addTransactionToPending = function (transactionObj) {
  //add transaction to mempool as pending transaction
  this.mempool.push(transactionObj);

  //return the block in which ttthis transaction will be included.
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

Blockchain.prototype.chainIsValid = function (blockchain) {
  let validChain = true;
  for (let i = 1; i < blockchain.chain.length; i++) {
    const currentBlock = blockchain.chain[i];
    const previousBlock = blockchain.chain[i - 1];
    const blockData = {
      data: currentBlock.transactions,
      index: previousBlock.index,
    };
    const hashBlock = this.hashBlock(
      previousBlock.hash,
      blockData,
      currentBlock.nonce
    );
    if (previousBlock.hash !== currentBlock.previousHash) validChain = false;
    if (hashBlock.substring(0, 4) !== "0000") validChain = false;
  }

  const genesisBlock = blockchain.chain[0];
  const correntGenesisNonce = genesisBlock.nonce === 786;
  const correctPBHash = genesisBlock.previousHash === "0x000000";
  const correctHash = genesisBlock.hash === "0x000000";
  const correctTransactions = genesisBlock.transactions.length === 0;
  if (
    !correntGenesisNonce ||
    !correctPBHash ||
    !correctHash ||
    !correctTransactions
  )
    validChain = false;

  return validChain;
};

module.exports = Blockchain;
