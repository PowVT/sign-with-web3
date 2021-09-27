# Sign messages with MetaMask or WalletConnect

## 🌴 Quick Start

In a command terminal run the following:

```bash
git clone https://github.com/PowVT/sign-with-web3.git
cd sign-with-web3
yarn install
yarn start
```

In a second command terminal spin up the server:
```bash
yarn backend
```

Go to http://localhost:3000 in your browser.

Connect your Ethereum wallet.

If your wallet possess a certain token, you will be allowed access to the 'secret message' which is stored in the backend server.

In this case, the token is GTC and you must have more than 1 GTC to access the secret message.

To change the token address or the logic around accessibility see the index.js file in packages/backend.

