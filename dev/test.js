const Blockchain = require("./blockchain");

const CryptCoin = new Blockchain();

CryptCoin.createNewTransaction(100, "Asad", "Ayan");
CryptCoin.createNewTransaction(100, "Asad", "Shafi");
CryptCoin.createNewTransaction(100, "Asad", "Kalim");

const nonceGot = CryptCoin.proofOfWork(
  CryptCoin.getLastBlock().previousHash,
  CryptCoin.mempool
);

CryptCoin.createNewBlock(
  nonceGot,
  CryptCoin.getLastBlock().hash,
  CryptCoin.hashBlock(
    CryptCoin.getLastBlock().hash,
    CryptCoin.mempool,
    nonceGot
  )
);

CryptCoin.createNewTransaction(300, "Ayan", "Shafi");
CryptCoin.createNewTransaction(10, "Shafi", "Ayan");
CryptCoin.createNewTransaction(90, "Ayan", "Asad");

const nonceGot2 = CryptCoin.proofOfWork(CryptCoin.getLastBlock().hash, {
  transactions: CryptCoin.mempool,
  timestamp: Date.now(),
});

CryptCoin.createNewBlock(
  nonceGot,
  CryptCoin.getLastBlock().hash,
  CryptCoin.hashBlock(
    CryptCoin.getLastBlock().hash,
    CryptCoin.mempool,
    nonceGot2
  )
);

CryptCoin.createNewTransaction(5, "Maaz", "Ahmed");
CryptCoin.createNewTransaction(10, "Ahmed", "Rizwan");
CryptCoin.createNewTransaction(26, "Rehaan", "Shafi");
CryptCoin.createNewTransaction(16, "Zeerufi", "Youtuber");

const nonceGot3 = CryptCoin.proofOfWork(CryptCoin.getLastBlock().hash, {
  transactions: CryptCoin.mempool,
  timestamp: Date.now(),
});

CryptCoin.createNewBlock(
  nonceGot,
  CryptCoin.getLastBlock().hash,
  CryptCoin.hashBlock(
    CryptCoin.getLastBlock().hash,
    CryptCoin.mempool,
    nonceGot3
  )
);

console.log(CryptCoin);
