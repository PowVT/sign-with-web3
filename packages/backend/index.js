var ethers = require("ethers");
var express = require("express");
var fs = require("fs");
const https = require('https')
var cors = require('cors')
var bodyParser = require("body-parser");

var app = express();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const INFURA_ID = "0998bcf49e0640fd9f31fb01262f8433";

let currentMessageForUseToSign = "**ADDRESS** would like to partake in the poll!";

const CONTRACT_ADDRESS = "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F"; // Gitcoin (GTC) contract

const CONTRACT_ABI = [{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"minter_","type":"address"},{"internalType":"uint256","name":"mintingAllowedAfter_","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegator","type":"address"},{"indexed":true,"internalType":"address","name":"fromDelegate","type":"address"},{"indexed":true,"internalType":"address","name":"toDelegate","type":"address"}],"name":"DelegateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegate","type":"address"},{"indexed":false,"internalType":"uint256","name":"previousBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newBalance","type":"uint256"}],"name":"DelegateVotesChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"delegator","type":"address"},{"indexed":false,"internalType":"address","name":"delegatee","type":"address"}],"name":"GTCDistChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"minter","type":"address"},{"indexed":false,"internalType":"address","name":"newMinter","type":"address"}],"name":"MinterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DELEGATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"GTCDist","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint32","name":"","type":"uint32"}],"name":"checkpoints","outputs":[{"internalType":"uint32","name":"fromBlock","type":"uint32"},{"internalType":"uint96","name":"votes","type":"uint96"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"}],"name":"delegate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"delegateBySig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegator","type":"address"},{"internalType":"address","name":"delegatee","type":"address"}],"name":"delegateOnDist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"delegates","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getCurrentVotes","outputs":[{"internalType":"uint96","name":"","type":"uint96"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"getPriorVotes","outputs":[{"internalType":"uint96","name":"","type":"uint96"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minimumTimeBetweenMints","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"mintCap","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"minter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"mintingAllowedAfter","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"numCheckpoints","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"GTCDist_","type":"address"}],"name":"setGTCDist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter_","type":"address"}],"name":"setMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}];

const HIDDEN_CONTENT = fs.readFileSync("./hiddenVideoContent.txt"); // Change to hiddenContent.txt if want poll not video. Ignored by git so it doesn't enter the repo publicly

let horseVotes = 0;
let cowVotes = 0;

let voters = [];
let voteHistory = [];

console.log("HIDDEN_CONTENT", HIDDEN_CONTENT);

function hasUserVoted(userAddress) {
    let result = false;
    for(let i=0; i < voters.length; i++) {
        if(voters[i] == userAddress) {
            result = true
        }
    }
    return result
}

app.get("/", function(req, res) {
    console.log("/")
    res.status(200).send(currentMessageForUseToSign);
});

// Sign in & check for GTC balance.
app.post('/sign-in', async function(request, response){
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log("POST from IP address: ", ip, request.body.message);
    // Verify message not manipulated.
    if(request.body.message != currentMessageForUseToSign.replace("**ADDRESS**", request.body.address)){
        response.send("⚠️ Message mismatch!?! Please reload and try again. Sorry! 😅")
    }
    else{
        let recovered = ethers.utils.verifyMessage(request.body.message, request.body.signature);
        let userAddress = request.body.address;
        if(recovered == userAddress){
            const mainnetInfura = new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/"+INFURA_ID);
            // Get ETH token balance
            //const tokenBalance = await mainnetInfura.getBalance(userAddress);
            // Get X token balance
            const mainnetToken = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, mainnetInfura);
            const tokenBalance = await mainnetToken.balanceOf(userAddress)
            console.log(tokenBalance)  
            if((tokenBalance) > 1*10**18) { // 1 GTC required for entry
                response.send(HIDDEN_CONTENT);
            }
            else{
                response.send("You must have at least one GTC to participate.")
            }
        }
    }
});

// Voting routes.
app.post('/cow-vote', function (request, response){
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log("POST from address: ", ip, request.body.address);
    const voted = hasUserVoted(request.body.address);
    if(voted == false) {
        voters.push(request.body.address);
        cowVotes++;
        console.log("Cow Votes",cowVotes)
        const obj = {};
        obj["address"] = request.body.address
        obj["vote"] = "Cow";
        voteHistory.push(obj);
        console.log(voteHistory);
        response.status(200).send([horseVotes,cowVotes, voteHistory]);
    }
    else{
        response.status(200).send([horseVotes,cowVotes, voteHistory]);
    }
    
})

app.post('/horse-vote', function (request, response){
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log("POST from address: ", ip, request.body.address);
    const voted = hasUserVoted(request.body.address);
    if(voted == false) {
        voters.push(request.body.address);
        horseVotes++;
        console.log("Horse Votes",horseVotes);
        const obj = {};
        obj["address"] = request.body.address
        obj["vote"] = "Horse";
        voteHistory.push(obj);
        console.log(voteHistory);
        response.status(200).send([horseVotes,cowVotes, voteHistory]);
    }    
    else {
        response.status(200).send([horseVotes,cowVotes, voteHistory]);
    }
})

var server = app.listen(49832, function () {
    console.log("HTTP Listening on port:", server.address().port);
});
