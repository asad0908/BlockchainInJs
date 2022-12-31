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
  const doesntExist = CryptCoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notSelf = CryptCoin.currentNodeUrl !== newNodeUrl;
  if (doesntExist && notSelf && newNodeUrl) {
    CryptCoin.networkNodes.push(newNodeUrl);

    const regNodesPromises = [];
    CryptCoin.networkNodes.forEach((networkUrl) => {
      const reqOptions = {
        uri: networkUrl + "/register-node",
        method: "post",
        body: {
          newNodeUrl: newNodeUrl,
        },
        json: true,
      };
      regNodesPromises.push(rp(reqOptions));
    });

    Promise.all(regNodesPromises)
      .then((data) => {
        const bulkRegisterOptions = {
          uri: newNodeUrl + "/register-bulk-nodes",
          method: "post",
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
        res.send({
          note: "New Node registered successfully with the network!",
        });
      });
  }
});

//register a node within the network
app.post("/register-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeDoesNotExist = CryptCoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notACurrentNode = CryptCoin.currentNodeUrl !== newNodeUrl;
  if (nodeDoesNotExist && notACurrentNode && newNodeUrl) {
    CryptCoin.networkNodes.push(newNodeUrl);
  }
  res.send({
    note: `New node ${newNodeUrl} registered successfully!`,
  });
});

//register multiple nodes at once
app.post("/register-bulk-nodes", (req, res) => {
  const bulkNodesToRegister = req.body.allNetworkNodes;
  bulkNodesToRegister.forEach((networkNodeurl) => {
    const nodeNotPresent = CryptCoin.networkNodes.indexOf(networkNodeurl) == -1;
    const notACurrentNode = CryptCoin.currentNodeUrl !== networkNodeurl;
    if (nodeNotPresent && notACurrentNode) {
      CryptCoin.networkNodes.push(networkNodeurl);
    }
  });
  res.send({
    note: "Bulk registration successful!",
  });
});

app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
