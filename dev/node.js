const express = require("express");
const Blockchain = require("./blockchain");
const parser = require("body-parser");
const port = process.argv[2];
const rp = require("request-promise");

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

//register and broadcast the node to the entire network
app.post("/register-and-broadcast-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  if (CryptCoin.networkNodes.indexOf(newNodeUrl) == -1)
    CryptCoin.networkNodes.push(newNodeUrl);

  const regNodesPromises = [];
  CryptCoin.networkNodes.forEach((networkNode) => {
    const requestOptions = {
      uri: networkNode + "/register-node",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true,
    };
    regNodesPromises.push(rp(requestOptions));
  });

  Promise.all(regNodesPromises)
    .then((data) => {
      const bulkRegisterOptions = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: {
          allNetworkNodes: [
            ...CryptCoin.networkNodes,
            CryptCoin.currentNodeUrl,
          ],
        },
        json: true,
      };
      return rp(bulkRegisterOptions);
    })
    .then((data) => {
      res.json({ note: "New Node registered with network successfully!" });
    });
});

//register a node within the network
app.post("/register-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeAlreadyNotPresent =
    CryptCoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = CryptCoin.currentNodeUrl !== newNodeUrl;
  if (nodeAlreadyNotPresent && notCurrentNode)
    CryptCoin.networkNodes.push(newNodeUrl);

  res.json({ note: "New node registered successfully with this node!" });
});

//register multiple nodes at once
app.post("/register-nodes-bulk", (req, res) => {});

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
