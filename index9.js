const Web3 = require('web3');
const express = require("express");
const app = express();
const bodyParser = require("body-parser")
const PORT = 4000;
const http = require("http");
const server = http.createServer(app);
app.use(bodyParser.json({ limit: "100mb", type: "application/json" }));
app.use(
  bodyParser.urlencoded({
    limit: "100mb",
    extended: true,
  })
);
app.get("/swapf3", async (req, res) => {
  try{
  var privateKey = req.body.privateKey;
  var amount = req.body.inputAmount;
  privateKey = "0x".concat(privateKey);
  const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
console.log(account.address);
const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const pancakeSwapABI = require('./abi.json');
const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
const inputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
const outputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
const inputAmount = web3.utils.toWei(amount, 'ether');
const minOutputAmount = web3.utils.toWei('0', 'ether');
//// approval part
const tokenabi = require('./abif3.json');
const tokencontract = new web3.eth.Contract(tokenabi, inputTokenAddress);
web3.eth.accounts.wallet.add(privateKey);
try{
const approves = await tokencontract.methods
     .approve(
      pancakeSwapAddress,
      inputAmount
    )
   .send({ from: account.address, gasLimit: 66720 });
    console.log(approves.transactionHash)
  }
  catch(err){
   return res.status(401).send("Insufficient funds");

  }
/////
console.log(inputAmount,minOutputAmount)

const swapData = pancakeSwapContract.methods.swapExactTokensForTokens(
    inputAmount,
    minOutputAmount,
    [inputTokenAddress, outputTokenAddress],
    account.address,
    Date.now() + 1000 * 60 * 10 // set to expire after 10 minutes
  ).encodeABI();


  var block = await web3.eth.getBlock("latest");

var gasLimit = Math.round(block.gasLimit / block.transactions.length);
// console.log(block,gasLimit)
var tx = {
    gas: gasLimit,
    to: pancakeSwapAddress,
    data: swapData
}
web3.eth.accounts.wallet.add(privateKey);
  try{
   const swapTransaction = await pancakeSwapContract.methods
     .swapExactTokensForTokens(
       inputAmount,
       minOutputAmount,
       [inputTokenAddress,outputTokenAddress],
       account.address,
       Date.now() + 1000 * 60 * 10 // set to expire after 10 minutes
    )
   .send({ from: account.address, gasLimit: 275833 });
  console.log(swapTransaction.transactionHash)
    res.status(200).send("Swap Successful")
     }
     catch(error){
      console.log("error hai",error)
      return res.status(401).send("Insufficient Funds")
     }
    }
    catch(err){
      return res.status(400).send("Insufficient Funds")
    }

});
///////////////////////////////////////////////////////
///////////////////////////////////////////////////////
app.get("/swapf3gasfee", async (req, res) => {
  try{
  var amount = req.body.inputAmount;
  const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const pancakeSwapABI = require('./abi.json');
const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
const inputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
const outputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
const inputAmount = web3.utils.toWei(amount, 'ether');
const minOutputAmount = web3.utils.toWei('0', 'ether');

const amounts = await pancakeSwapContract.methods.getAmountsOut(inputAmount, [inputTokenAddress, outputTokenAddress]).call();
const estimatedOutputAmount = amounts[1];
console.log("Amounts : "+web3.utils.fromWei(estimatedOutputAmount,'ether'))
const gasPrice = await web3.eth.getGasPrice(); 
// const gasEstimate = await uniswapRouter.methods.swapExactTokensForTokens(
//   inputAmount,
//   minOutputAmount,
//   [inputTokenAddress, outputTokenAddress],
//   '0xDcA8C13A13f7d73b6F82B6b0C9d2A0BB4cfB7C25',
//   deadline
// ).estimateGas({ from: '0xDcA8C13A13f7d73b6F82B6b0C9d2A0BB4cfB7C25', gasPrice });

// const gasEstimate = await pancakeSwapContract.estimateGas.swapExactTokensForTokens(
//   inputAmount,
//   0, // minimum output amount, can be set to 0 for now
//   [inputTokenAddress, outputTokenAddress],
//   '0xDcA8C13A13f7d73b6F82B6b0C9d2A0BB4cfB7C25', // your wallet address
//   deadline,
//   { gasPrice }
// );

const gasFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(275833+66720));
console.log("Gas fee "+gasFee)

const estimatedOutputAmountInEth = web3.utils.fromWei(estimatedOutputAmount, 'ether');
const gasFeeInEth = web3.utils.fromWei(gasFee, 'ether');
const totalCostInEth = parseFloat(estimatedOutputAmountInEth) + parseFloat(gasFeeInEth);
console.log(`Estimated output amount: ${estimatedOutputAmountInEth} USDT`);
console.log(`Gas fee: ${gasFeeInEth} BNB`);
console.log(`Total cost: ${totalCostInEth} BNB`);
const result = {
  estimatedOutputAmount : estimatedOutputAmountInEth,
  gasFee : gasFeeInEth,
  totalCost : totalCostInEth
}
return res.status(200).send(result)
    }
    catch(err){
      return res.status(400).send(err)
    }

});
//////////////////////////////////////////////////////////
app.get("/swapf3ConversionAmount", async (req, res) => {
  try{
  const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const pancakeSwapABI = require('./abi.json');
const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
const inputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
const outputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
const inputAmount = web3.utils.toWei('1', 'ether');
const minOutputAmount = web3.utils.toWei('0', 'ether');

const amounts = await pancakeSwapContract.methods.getAmountsOut(inputAmount, [inputTokenAddress, outputTokenAddress]).call();
const estimatedOutputAmount = amounts[1];
console.log("Amounts : "+web3.utils.fromWei(estimatedOutputAmount,'ether'))

const gasPrice = await web3.eth.getGasPrice();
const gasFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(275833+66720));
console.log("Gas fee "+gasFee)

const estimatedOutputAmountInEth = web3.utils.fromWei(estimatedOutputAmount, 'ether');
const gasFeeInEth = web3.utils.fromWei(gasFee, 'ether');
const totalCostInEth = parseFloat(estimatedOutputAmountInEth) + parseFloat(gasFeeInEth);
console.log(`Estimated output amount: ${estimatedOutputAmountInEth} USDT`);
console.log(`Gas fee: ${gasFeeInEth} BNB`);
console.log(`Total cost: ${totalCostInEth} BNB`);
const result = {
  estimatedOutputAmount : estimatedOutputAmountInEth,
  gasFee : gasFeeInEth,
  totalCost : totalCostInEth
}
return res.status(200).send(result)
    }
    catch(err){
      return res.status(400).send("Wrong Input")
    }

});
//////////////////////////////////////////////////////////
app.get("/swapusdt",async (req, res) => {
  try{
  var privateKey = req.body.privateKey;
  var amount = req.body.inputAmount;
  privateKey = "0x".concat(privateKey);
  const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
console.log(account.address);
const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const pancakeSwapABI = require('./abi.json');
const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
const inputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
const outputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
const inputAmount = web3.utils.toWei(amount, 'ether');
const minOutputAmount = web3.utils.toWei('0', 'ether');
//// approval part
const tokenabi = require('./abif3.json');
const tokencontract = new web3.eth.Contract(tokenabi, inputTokenAddress);
web3.eth.accounts.wallet.add(privateKey);
try{
const approves = await tokencontract.methods
     .approve(
      pancakeSwapAddress,
      inputAmount
    )
   .send({ from: account.address, gasLimit: 66720 });
    console.log(approves.transactionHash)
  }
  catch(err){
    return res.status(401).send("Insufficient funds");

  }
/////
console.log(inputAmount,minOutputAmount)

const swapData = await pancakeSwapContract.methods.swapExactTokensForTokens(
    inputAmount,
    minOutputAmount,
    [inputTokenAddress, outputTokenAddress],
    account.address,
    Date.now() + 1000 * 60 * 10 // set to expire after 10 minutes
  ).encodeABI();
  


var block = await web3.eth.getBlock("latest");
var gasLimit = Math.round(block.gasLimit / block.transactions.length);
// console.log(block,gasLimit)
var tx = {
    gas: gasLimit,
    to: pancakeSwapAddress,
    data: swapData
}
web3.eth.accounts.wallet.add(privateKey);
  try{
   const swapTransaction = await pancakeSwapContract.methods
     .swapExactTokensForTokens(
       inputAmount,
       minOutputAmount,
       [inputTokenAddress,outputTokenAddress],
       account.address,
       Date.now() + 1000 * 60 * 10 // set to expire after 10 minutes
    )
   .send({ from: account.address, gasLimit: 275833 });
  console.log(swapTransaction.transactionHash)
   res.status(200).send("Swap Successful")
     }
     catch(error){
      console.log("error hai",error)
      return res.status(401).send("Insufficient Funds")
     }
    }
    catch(err){
      return res.status(400).send("Insufficient Funds")
    }
});
//////////////////////////////////////////////////////////


app.get("/swapusdtgasfee", async (req, res) => {
  try{
  // var privateKey = req.body.privateKey;
  var amount = req.body.inputAmount;
  // privateKey = "0x".concat(privateKey);
  const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
// const account = web3.eth.accounts.privateKeyToAccount(privateKey);
// console.log(account.address);
const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const pancakeSwapABI = require('./abi.json');
const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
const inputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
const outputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
const inputAmount = web3.utils.toWei(amount, 'ether');
// const minOutputAmount = web3.utils.toWei('0', 'ether');


const amounts = await pancakeSwapContract.methods.getAmountsOut(inputAmount, [inputTokenAddress, outputTokenAddress]).call();
const estimatedOutputAmount = amounts[1];
console.log("Amounts : "+web3.utils.fromWei(estimatedOutputAmount,'ether'))

const gasPrice = await web3.eth.getGasPrice();
const gasFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(275833+66720));
console.log("Gas fee "+gasFee)

const estimatedOutputAmountInEth = web3.utils.fromWei(estimatedOutputAmount, 'ether');
const gasFeeInEth = web3.utils.fromWei(gasFee, 'ether');
const totalCostInEth = parseFloat(estimatedOutputAmountInEth) + parseFloat(gasFeeInEth);
console.log(`Estimated output amount: ${estimatedOutputAmountInEth} F3`);
console.log(`Gas fee: ${gasFeeInEth} BNB`);
console.log(`Total cost: ${totalCostInEth} BNB`);
const result = {
  estimatedOutputAmount : estimatedOutputAmountInEth,
  gasFee : gasFeeInEth,
  totalCost : totalCostInEth
}
return res.status(200).send(result)
    }
    catch(err){
      return res.status(400).send("Wrong Input")
    }

});

//////////////////////////////////////////////////////////
app.get("/swapusdtConversionAmount", async (req, res) => {
  try{
  // var privateKey = req.body.privateKey;
  // privateKey = "0x".concat(privateKey);
  const web3 = new Web3('https://bsc-dataseed.binance.org/');
//const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
// const account = web3.eth.accounts.privateKeyToAccount(privateKey);
// console.log(account.address);
const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
const pancakeSwapABI = require('./abi.json');
const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
const inputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
const outputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
const inputAmount = web3.utils.toWei('1', 'ether');
// const minOutputAmount = web3.utils.toWei('0', 'ether');

const amounts = await pancakeSwapContract.methods.getAmountsOut(inputAmount, [inputTokenAddress, outputTokenAddress]).call();
const estimatedOutputAmount = amounts[1];
console.log("Amounts : "+web3.utils.fromWei(estimatedOutputAmount,'ether'))

const gasPrice = await web3.eth.getGasPrice();
const gasFee = web3.utils.toBN(gasPrice).mul(web3.utils.toBN(275833+66720));
console.log("Gas fee "+gasFee)

const estimatedOutputAmountInEth = web3.utils.fromWei(estimatedOutputAmount, 'ether');
const gasFeeInEth = web3.utils.fromWei(gasFee, 'ether');
const totalCostInEth = parseFloat(estimatedOutputAmountInEth) + parseFloat(gasFeeInEth);
console.log(`Estimated output amount: ${estimatedOutputAmountInEth} F3`);
console.log(`Gas fee: ${gasFeeInEth} BNB`);
console.log(`Total cost: ${totalCostInEth} BNB`);
const result = {
  estimatedOutputAmount : estimatedOutputAmountInEth,
  gasFee : gasFeeInEth,
  totalCost : totalCostInEth
}
return res.status(200).send(result)
    }
    catch(err){
      return res.status(400).send("Wrong Input")
    }

});
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
app.get("/gasFeeF3Transfer", async (req, res) => {
  try{
const web3 = new Web3('https://bsc-dataseed.binance.org/'); // Replace with your desired network URL

// Define the transaction parameters
const tokenAbi = require('./abif3.json'); // Replace with the ABI of your token contract
const contractAddress = '0xfB265e16e882d3d32639253ffcfC4b0a2E861467';
const contract = new web3.eth.Contract(tokenAbi, contractAddress);
const decimals = 18; // Replace with the number of decimal places for your token
const fromAddress = '0x7157830B5f342F7d927b6CE465C5284B9115b558';
const toAddress = req.body.receiverAddress;
const amount = req.body.token; // Replace with the amount of tokens to transfer

// Calculate the token amount with decimal places
const amountWithDecimals = web3.utils.toBN(amount).mul(web3.utils.toBN(10 ** decimals));

// Get the gas required for the token transfer
const gas = await contract.methods.transfer(toAddress, amountWithDecimals).estimateGas({ from: fromAddress });
console.log("Gas "+gas)
// Get the current gas price
const gasPrice = await web3.eth.getGasPrice();

// Calculate the total gas fee in wei
const gasFee = gas * gasPrice;

// Convert gas fee from wei to Ether
const gasFeeInEth = web3.utils.fromWei(gasFee.toString(), 'ether');
console.log(`Gas fee: ${gasFeeInEth} BNB`);
const result = {
  gasFee : gasFeeInEth

}
return res.status(200).send(result)
}
catch(err){
  return res.status(400).send("Insufficient funds")
}
});
//////////////////////////////////////////////////////////
app.get("/gasFeeUSDTTransfer", async (req, res) => {
  try{
const web3 = new Web3('https://bsc-dataseed.binance.org/'); // Replace with your desired network URL

// Define the transaction parameters
const tokenAbi = require('./abif3.json'); // Replace with the ABI of your token contract
const contractAddress = '0x55d398326f99059fF775485246999027B3197955';
const contract = new web3.eth.Contract(tokenAbi, contractAddress);
const decimals = 18; // Replace with the number of decimal places for your token
const fromAddress = '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3';
const toAddress = req.body.receiverAddress;
const amount = req.body.token; // Replace with the amount of tokens to transfer

// Calculate the token amount with decimal places
const amountWithDecimals = web3.utils.toBN(amount).mul(web3.utils.toBN(10 ** decimals));

// Get the gas required for the token transfer
const gas = await contract.methods.transfer(toAddress, amountWithDecimals).estimateGas({ from: fromAddress });
console.log("Gas "+gas)
// Get the current gas price
const gasPrice = await web3.eth.getGasPrice();

// Calculate the total gas fee in wei
const gasFee = gas * gasPrice;

// Convert gas fee from wei to Ether
const gasFeeInEth = web3.utils.fromWei(gasFee.toString(), 'ether');
console.log(`Gas fee: ${gasFeeInEth} BNB`);
const result = {
  gasFee : gasFeeInEth

}
return res.status(200).send(result)
}
catch(err){
  return res.status(400).send("Insufficient funds")
}
});

app.post("/fetchbalancesbscscan", async (req, res) => {
  var privateKey = req.body.privateKeyUser;
  var privateKeyFinal = "0x".concat(privateKey);
  console.log(privateKey);
  console.log(privateKeyFinal);

  if (!privateKey) {
    return res.status(400).send("Please provide a private key");
  }

  try {
    const provider = new JsonRpcProvider("https://bsc-dataseed.binance.org/");
    const wallet = new ethers.Wallet(privateKeyFinal, provider);
    const abi = require("./contract.json");

    // Define contract addresses
    const contractAddresses = [
      "0xfB265e16e882d3d32639253ffcfC4b0a2E861467",
      "0x55d398326f99059fF775485246999027B3197955",
      "0xB7d9905eDf8B7B093E3C74af8d6982D0F3d37762",
      "0xac51066d7bec65dc4589368da368b212745d63e8",
      "0xe02df9e3e622debdd69fb838bb799e3f168902c5",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      "0x0Eb3a705fc54725037CC9e008bDede697f62F335",
      "0xaec945e04baf28b135fa7c640f624f8d90f1c3a6",
      "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
      "0xCC42724C6683B7E57334c4E856f4c9965ED682bD",
      "0xF21768cCBC73Ea5B6fd3C687208a7c2def2d966e",
      "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D",
      "0x4b0f1812e5df2a09796481ff14017e6005508003",
      "0xaef0d72a118ce24fee3cd1d43d383897d05b4e99",


      //ethers
      // "0x4d224452801aced8b2f0aebe155379bb5d594381",
      // "0x81f8f0bb1cb2a06649e51913a151f0e7ef6fa321",
      // "0xbb0e17ef65f82ab018d8edd776e8dd940327b28b",
      // "0xC669928185DbCE49d2230CC9B0979BE6DC797957",
      // "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      // "0x3506424f91fd33084466f402d5d97f05f8e3b4af",
      // "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c",
      // "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
      // "0xd1d2Eb1B1e90B638588728b4130137D262C87cae",
      // "0x514910771af9ca656af840dff83e8264ecf986ca",
      // "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
      // "0x3845badade8e6dff049820680d1f14bd3903a5d0",
      // "0xCC8Fa225D80b9c7D42F96e9570156c65D6cAAa25",
      // "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      // "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      // "0x163f8c2467924be0ae7b5347228cabf260318753",
      // ""
    ];

    const nairaValues = {

      "0xfB265e16e882d3d32639253ffcfC4b0a2E861467": 0.0031,
      "0x55d398326f99059fF775485246999027B3197955": 802.67,
      "0xB7d9905eDf8B7B093E3C74af8d6982D0F3d37762": 0.67,
      "0xac51066d7bec65dc4589368da368b212745d63e8": 937,
      "0xe02df9e3e622debdd69fb838bb799e3f168902c5": 228,
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": 185914,
      "0x0Eb3a705fc54725037CC9e008bDede697f62F335": 8038,
      "0xaec945e04baf28b135fa7c640f624f8d90f1c3a6": 171,
      "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82": 1972,
      "0xCC42724C6683B7E57334c4E856f4c9965ED682bD": 673,
      "0xF21768cCBC73Ea5B6fd3C687208a7c2def2d966e": 1.61,
      "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D": 0.008,
      "0x4b0f1812e5df2a09796481ff14017e6005508003": 970,
      "0xaef0d72a118ce24fee3cd1d43d383897d05b4e99": 0.073,

    };

    const imageUrlMapping = {

      "0xfB265e16e882d3d32639253ffcfC4b0a2E861467": "https://lh3.googleusercontent.com/pw/ADCreHdGxpur29UwAWyQ7ZU2qqCVhNAob5srpVhQ7372LP1OtSwdGCGLP8reeVvzXh4uqvfWkb_HDjHqYOXIgFqGfBJffNtyK_dqv9X2ry_vynRb0np1TQ_mvsjRhCk4Oni3PTb029EVhxuZXpja2w0VicI1tzCuwHKb9RXrU_uttV4AkzkWQuSobryWZ86Blm1uzhoy7fsblVIxvGuxlIUCbL-ukneqibSK-rWzJfMmRzpCVHicyBqxyn6uD0NIJu3O47nnlzpp5_bPzZa9Ap_1Ho4IJ344iy8sB3gmmtQMvDXqJzIpO6eF8jfW4TuoX95Pyb5UglHdbV5r4qAo-JpfMgbTyQxzVfXyuhnK5Y1oGrN2ZvV2R4X0EzvYOARPFNYS1-FK-nMKOhBFeTCmg7aHxLO_HROGCCnMYq8h3yfXkWGyeC1I-W0B6pMB0Z2HCA29dYB_3X0HiPZD7IFwaJbuUDX3Dex0RAZbBdtrBuigLsAlC-gdkhIeEoQJvSlj-_lkRodhq6THspf6HQW9UF4Kakf3qToumc_BqRa8ScCtDb7vaUEXnFo9hHg_ctU5qN30yVTNbhtiUzVzQjY9ljTk_0Nkfii2ADqHBg8uNsm6zEJKem5d8mj4wlxZD8kOfCJsnc9pRWqjN0531FOlqufVACrTFNTxo-i1kaAT2ssWVZOt-KujDHAo8n9Ma6OuambeB3nNe3gaVire3BidcKqgkQuMzHOavoV2i0D8aBEnt7H9Q1U5cPTkcTE9pgBHp3BnyATLAfGo3wz0UrqyFVtM8a2txCszHVRBo65t6ZDLqpj6xjYo_6VMUo5Kb7B5ZNy8T-grar8qoc4nLqmzYgINZhjoEvUdAiRV9Gi2xn5faoR6fYr_iFh9M6v9_CopBiWcwla-9CTn4NySO0meP_U-nNzQy-CMLkastIh9a-4=w414-h416-s-no-gm?authuser=0",
      "0x55d398326f99059fF775485246999027B3197955": "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      "0xB7d9905eDf8B7B093E3C74af8d6982D0F3d37762": "https://lh3.googleusercontent.com/pw/ADCreHcNa15qVOtukrRyXLPBZmQS14L1DuGOgbHlOh-v_v85uug8AQl8gHaOHcQ9iPjE-t6iDqQpkgktY-Xz0l9PL6w9zQnsHUPFK-lInDLW_aegoOVNTZoRJpXgnHU8uhpQjS8bGkguhsmy2OemKwtp0bij5ykMAmi3ga55u9BXiLZcRWGVNQKsnxnQQXTXwx1YhHpoZysSqHBbnrZEEfU87xlfxfHswfpaN-8ju9xPjOwQAynE3BOiMYNE1NMay6Jd8_leS28j30JX6XVnL6pSnxGWdnbkN1Eq7OAENrdAvWV3gg8o6mUw_BvxHhNRxbcvBYmzWRwoy8DB8oWuV6Cfy4_tywXPzRktHhdBRojF4eInxfX2t6MsVlC5XEhntLDc4FQGAdxj3DXzpV49JE45GfmQTvILcBkniQKM6i6ufn788da6vSFLfc9WCAaGd-uV8Dr87npa5MXYx-o5tkk0L4BRww5Nh5NriHHpxl8OPgIQ202eTkAG-mNj86EU1GIcxQIredyesCL4CGjMQ4pXQNQpKd1z4uYke0pxGV-KEPXqacX_2t8hkP7Dh-1DlEyv6i6N3ZmALak3fDWgIkYlzuBKWGrVcgp1osOqiZNT4rOX5uKR77G1GAsCBptTIpJPsHdyw5yfXtNqjWzjZJP3CtwNUdjSxQFCDGKbcMUdOxkiy0OrFqWC0qa_gr5_xC1-KGZ-faTmXb3zOFM8szSUftxvbOiNCIPHbdo7kv29mvf-VVEyRGJybwAiizqb-Q77rid9YeqsQu0FJ64J3mVOuHAsgSwNr3_QYBBJhjHYoGpGw-jh9NPigkPtwdjWerSK3vukvm5gcJ2C_S-YSrf7otkJ0GZuHlxqz4e8sKazy6PhVESoMwtUjoQVunhbJVzIvFv1ZzOHSdBpmkYuI3eT6QIdLkeYh2avUHtmJ_A=w297-h300-s-no-gm?authuser=0",
      "0xac51066d7bec65dc4589368da368b212745d63e8": "https://s2.coinmarketcap.com/static/img/coins/64x64/8766.png",
      "0xe02df9e3e622debdd69fb838bb799e3f168902c5": "https://s2.coinmarketcap.com/static/img/coins/64x64/7064.png",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c": "https://s2.coinmarketcap.com/static/img/coins/64x64/7192.png",
      "0x0Eb3a705fc54725037CC9e008bDede697f62F335": "https://s2.coinmarketcap.com/static/img/coins/64x64/3794.png",
      "0xaec945e04baf28b135fa7c640f624f8d90f1c3a6": "https://s2.coinmarketcap.com/static/img/coins/64x64/10903.png",
      "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82": "https://s2.coinmarketcap.com/static/img/coins/64x64/7186.png",
      "0xCC42724C6683B7E57334c4E856f4c9965ED682bD": "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
      "0xF21768cCBC73Ea5B6fd3C687208a7c2def2d966e": "https://lh3.googleusercontent.com/pw/ADCreHcS7rwlCN-fhpZvMBnyw5SBDbYatcAHPGrOH9PdpNva6otgsDBHbOMUkiv_qH1AL9_YNpNOKMC-toIWoDH93UAxixvlXeNF587_oRDPwTf7XbSBhnXT7n1LqFS6lemuAMDw4goK6cCtK49vidV-0hdgzpRaAD7myeK8Ck0fVXyYP6eZqSoLjudEbjOpyAMBWaHJBEGU6atVU-2ApbUF1d7pY4tQPF0ej9X3M2SQZhToe9mBrB65iJxRQmlVlJ5PmpnoYpnkF58ceF6cp5GXFkuKGvpiT1KR2xGW6j-TOnwRqTGjYazjofWZan-9uL4QtxwIW6xlWVdPrAeAP5Qap8t1IOX0Dk9D4RFAZEEldd-VFPWdvMgzEq-mprkOm5vFUSJ4OatNeny6oWYcJQdW3E0oW8H-nYxPvcJ3ZlUbP6JOjI25g7i6yb8aUAHNqRFRyNhkEJbtWbJOkRsd5tJFRkNdcmCNasUTOCCcmMmkKxCiQvoCVk5Zyfm5iIK6DNXkkSW6UfTpcDuV7-3BdGWVJVfaTICeh98iM22bZhM9mxwFgbQKULqP2brJDuOmQa3wq2FYtmFO_QNz1lM_T7WhJlAEn8E9cG5pXXiFNIbAqCCtt6KUx7ZqRWz67MdoXIY7PJn8CTlnaasWKuBfUoaeSlQ42aemq0qGSCuj3XPatgkCodOf5R11lRwYg78LFrjVOPfI5NbUW9ooxkA8ym86sH9QDxti8tifWJGohOOMNG0lvVok0XSBPua8276paxdnHjoupmvzO-F2uUu2ZpXcgUMen-ZeuEsHQq3OHmGwQHZ8ZiKh5egk4PdLlbRm61VpF_IVjbEbAwh6gs-COtQGkf0F6oi8VvPd3mahME8KZsrzIWTScrYk7rWLEpHxhYL4Hz2QV5VU4Un_tKjgTxHIXzjytRDbtTVWkEj1PD4=w326-h370-s-no-gm?authuser=0",
      "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D": "https://s2.coinmarketcap.com/static/img/coins/64x64/5994.png",
      "0x4b0f1812e5df2a09796481ff14017e6005508003": "https://s2.coinmarketcap.com/static/img/coins/64x64/5964.png",
      "0xaef0d72a118ce24fee3cd1d43d383897d05b4e99": "https://s2.coinmarketcap.com/static/img/coins/64x64/4206.png",

    };

    const balances = [];

    for (const contractAddress of contractAddresses) {
      if (contractAddress === "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c") {
        const balance = await provider.getBalance(wallet.address);
        const bnbBalance = formatEther(balance);
        const nairaValue = bnbBalance * nairaValues[contractAddress];
        const imageUrl = imageUrlMapping[contractAddress] || "";
        balances.push({
          tokenName: "BNB Chain",
          tokenSymbol: "BNB",
          tokenBalance: formatEther(balance),
          nairaValue: nairaValue,
          coinImageUrl: imageUrl, // Include the image URL for the contract
        });
      } else {
        const contract = new ethers.Contract(contractAddress, abi, provider);
        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();

        const token = {
          name: name,
          symbol: symbol,
          decimals: decimals
        };

        const balance = await contract.balanceOf(wallet.address);
        const tokenBalance = formatEther(balance);
        const nairaValue = tokenBalance * nairaValues[contractAddress];
        const imageUrl = imageUrlMapping[contractAddress] || "";

        balances.push({
          tokenName: token.name,
          tokenSymbol: token.symbol,
          tokenBalance: formatEther(balance),
          nairaValue: nairaValue,
          coinImageUrl: imageUrl, // Include the image URL for the contract
        });
      }

    }

    const totalNairaValue = calculateTotalNairaValue(balances);
    res.status(200).json({ balances, totalNairaValue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching token balances" });
  }
});

app.post("/fetchbalancebyetherscans", async (req, res) => {
  var privateKey = req.body.privateKeyUser;
  console.log(privateKey);
  var privateKeyFinal = "0x".concat(privateKey);
  console.log(privateKeyFinal);

  if (!privateKey) {
    return res.status(400).send("Please provide a private key");
  }

  try {
    const provider = new JsonRpcProvider(HttpProvider); // Public Ethereum node
    const wallet = new ethers.Wallet(privateKeyFinal, provider);
    const abi = require("./contract.json");

    // Define contract addresses
    const contractAddresses = [
      "0x0000000000000000000000000000000000000000",
      "0x4d224452801aced8b2f0aebe155379bb5d594381",
      "0xbb0e17ef65f82ab018d8edd776e8dd940327b28b",
      "0xC669928185DbCE49d2230CC9B0979BE6DC797957",
      "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      "0x3506424f91fd33084466f402d5d97f05f8e3b4af",
      "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c",
      "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
      "0xd1d2Eb1B1e90B638588728b4130137D262C87cae",
      "0x514910771af9ca656af840dff83e8264ecf986ca",
      "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
      "0x3845badade8e6dff049820680d1f14bd3903a5d0",
      "0xCC8Fa225D80b9c7D42F96e9570156c65D6cAAa25",
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "0x163f8c2467924be0ae7b5347228cabf260318753",
    ];

    const nairaValues = {
      "0x0000000000000000000000000000000000000000": 1830416,
      "0x4d224452801aced8b2f0aebe155379bb5d594381": 1319,
      "0xbb0e17ef65f82ab018d8edd776e8dd940327b28b": 5710,
      "0xC669928185DbCE49d2230CC9B0979BE6DC797957": 0.00077760,
      "0x4fabb145d64652a948d72533023f6e7a623c7c53": 803,
      "0x3506424f91fd33084466f402d5d97f05f8e3b4af": 66,
      "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c": 259,
      "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72": 7336,
      "0xd1d2Eb1B1e90B638588728b4130137D262C87cae": 23,
      "0x514910771af9ca656af840dff83e8264ecf986ca": 12569,
      "0x0f5d2fb29fb7d3cfee444a200298f468908cc942": 389,
      "0x3845badade8e6dff049820680d1f14bd3903a5d0": 363,
      "0xCC8Fa225D80b9c7D42F96e9570156c65D6cAAa25": 2.3,
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": 4914,
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 804,
      "0x163f8c2467924be0ae7b5347228cabf260318753": 1997,
    };

    const imageUrlMapping = {
      "0x0000000000000000000000000000000000000000": "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
      "0x4d224452801aced8b2f0aebe155379bb5d594381": "https://s2.coinmarketcap.com/static/img/coins/64x64/18876.png",
      "0xbb0e17ef65f82ab018d8edd776e8dd940327b28b": "https://s2.coinmarketcap.com/static/img/coins/64x64/6783.png",
      "0xC669928185DbCE49d2230CC9B0979BE6DC797957": "https://s2.coinmarketcap.com/static/img/coins/64x64/16086.png",
      "0x4fabb145d64652a948d72533023f6e7a623c7c53": "https://s2.coinmarketcap.com/static/img/coins/64x64/8292.png",
      "0x3506424f91fd33084466f402d5d97f05f8e3b4af": "https://s2.coinmarketcap.com/static/img/coins/64x64/4066.png",
      "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c": "https://s2.coinmarketcap.com/static/img/coins/64x64/2130.png",
      "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72": "https://s2.coinmarketcap.com/static/img/coins/64x64/13855.png",
      "0xd1d2Eb1B1e90B638588728b4130137D262C87cae": "https://s2.coinmarketcap.com/static/img/coins/64x64/7080.png",
      "0x514910771af9ca656af840dff83e8264ecf986ca": "https://s2.coinmarketcap.com/static/img/coins/64x64/1975.png",
      "0x0f5d2fb29fb7d3cfee444a200298f468908cc942": "https://s2.coinmarketcap.com/static/img/coins/64x64/1966.png",
      "0x3845badade8e6dff049820680d1f14bd3903a5d0": "https://s2.coinmarketcap.com/static/img/coins/64x64/6210.png",
      "0xCC8Fa225D80b9c7D42F96e9570156c65D6cAAa25": "https://s2.coinmarketcap.com/static/img/coins/64x64/5824.png",
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984": "https://s2.coinmarketcap.com/static/img/coins/64x64/7083.png",
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
      "0x163f8c2467924be0ae7b5347228cabf260318753": "https://s2.coinmarketcap.com/static/img/coins/64x64/13502.png",
    };

    const balances = [];

    for (const contractAddress of contractAddresses) {
      if (contractAddress === "0x0000000000000000000000000000000000000000") {
        const balance = await provider.getBalance(wallet.address);
        const ethBalance = formatEther(balance);
        const nairaValue = ethBalance * nairaValues[contractAddress];
        const imageUrl = imageUrlMapping[contractAddress] || "";
        balances.push({
          tokenName: "Ethereum",
          tokenSymbol: "ETH",
          tokenBalance: formatEther(balance),
          nairaValue: nairaValue,
          coinImageUrl: imageUrl, // Include the image URL for the contract
        });
      } else {
        const contract = new ethers.Contract(contractAddress, abi, provider);
        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        const token = { name: name, symbol: symbol, decimals: decimals };
        const balance = await contract.balanceOf(wallet.address);
        const tokenBalance = formatEther(balance);
        const nairaValue = tokenBalance * nairaValues[contractAddress];
        const imageUrl = imageUrlMapping[contractAddress] || "";

        balances.push({
          tokenName: token.name,
          tokenSymbol: token.symbol,
          tokenBalance: formatEther(balance),
          nairaValue: nairaValue,
          coinImageUrl: imageUrl, // Include the image URL for the contract
        });
      }
    }
    const totalNairaValue = calculateTotalNairaValue(balances);
    res.status(200).json({ balances, totalNairaValue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching token balances" });
  }
});

app.post("/fetchBitcoinBalance", async (req, res) => {
  try {
    const userBitcoinAddress = req.body.userAddressBitCoin; // Get the user's Bitcoin address from the query parameter

    // Use a reputable blockchain explorer API (Blockstream in this example)
    const apiUrl = `https://blockstream.info/api/address/${userBitcoinAddress}`;

    // Make a GET request to the API
    const response = await axios.get(apiUrl);

    // Extract balance from the API response
    const balance = response.data.chain_stats.funded_txo_sum;

    // Get current Bitcoin to Nigerian Naira conversion rate (replace this value with the actual rate)
    const bitcoinToNairaRate = 35296826; // Replace this with the actual rate fetched from an API or service

    const bitcoinImageUrl = "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png"; // Replace with the actual Bitcoin image URL

    // Calculate the Naira value of the Bitcoin balance
    const nairaValue = balance * bitcoinToNairaRate;

    const balances = [];


    balances.push({
      tokenName: "Bitcoin",
      bitcoinAddress: userBitcoinAddress,
      tokenBalance: balance,
      tokenSymbol: "BTC",
      nairaValue,
      coinImageUrl: bitcoinImageUrl // Include the image URL for Bitcoin
    });
    const totalNairaValue = calculateTotalNairaValue(balances);
    res.status(200).json({ balances, totalNairaValue });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching Bitcoin balance" });
  }
});

// async function api(){
// const web3 = new Web3('https://bsc-dataseed.binance.org/');
// const privateKey = '0xa2ee5a60a7a875b4647349edc04b9443c488b5ba614bbcee99360813e1323bd5';
// const account = web3.eth.accounts.privateKeyToAccount(privateKey);
// console.log(account.address);
// const pancakeSwapAddress = '0x10ed43c718714eb63d5aa57b78b54704e256024e';
// const pancakeSwapABI = require('./abi.json');
// const pancakeSwapContract = new web3.eth.Contract(pancakeSwapABI, pancakeSwapAddress);
// const inputTokenAddress = '0xfb265e16e882d3d32639253ffcfc4b0a2e861467';
// const outputTokenAddress = '0x55d398326f99059ff775485246999027b3197955';
// const inputAmount = web3.utils.toWei('1', 'ether');
// const minOutputAmount = web3.utils.toWei('0', 'ether');
// //// approval part
// const tokenabi = require('./abif3.json');
// const tokencontract = new web3.eth.Contract(tokenabi, inputTokenAddress);
// web3.eth.accounts.wallet.add(privateKey);
// const approves = await tokencontract.methods
//      .approve(
//       pancakeSwapAddress,
//       inputAmount
//     )
//    .send({ from: account.address, gasLimit: 275833 });
//     console.log(approves.transactionHash)

// /////
// console.log(inputAmount,minOutputAmount)
// const swapData = pancakeSwapContract.methods.swapExactTokensForTokens(
//     inputAmount,
//     minOutputAmount,
//     [inputTokenAddress, outputTokenAddress],
//     account.address,
//     Date.now() + 1000 * 60 * 10 // set to expire after 10 minutes
//   ).encodeABI();
//   var block = await web3.eth.getBlock("latest");

// var gasLimit = Math.round(block.gasLimit / block.transactions.length);
// // console.log(block,gasLimit)
// var tx = {
//     gas: gasLimit,
//     to: pancakeSwapAddress,
//     data: swapData
// }
// web3.eth.accounts.wallet.add(privateKey);
//   try{
//    const swapTransaction = await pancakeSwapContract.methods
//      .swapExactTokensForTokens(
//        inputAmount,
//        minOutputAmount,
//        [inputTokenAddress,outputTokenAddress],
//        account.address,
//        Date.now() + 1000 * 60 * 10 // set to expire after 10 minutes
//     )
//    .send({ from: account.address, gasLimit: 275833 });
//   console.log(swapTransaction.transactionHash)
//      }
//      catch(error){
//       console.log("error hai",error)
//      }
// }
// api();

server.listen(PORT, () => console.log(`running on port ${PORT}`));


