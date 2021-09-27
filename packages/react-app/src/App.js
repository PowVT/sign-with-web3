import React, { useCallback, useState } from "react";
import { Button, message } from "antd";
import "antd/dist/antd.css";
import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import { useUserProvider, useExchangePrice } from "./hooks";
import { Account } from "./components";
import { useUserAddress } from "eth-hooks";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { INFURA_ID, NETWORKS } from "./constants";
import './App.css';

const axios = require('axios');

const DEBUG = false;

const serverUrl = "http://localhost:49832/";
const targetNetwork = NETWORKS['mainnet'];
const blockExplorer = targetNetwork.blockExplorer;

const mainnetInfura = new StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
const localProviderUrl = targetNetwork.rpcUrl;
console.log("🏠 Connecting to provider:", localProviderUrl);
const localProvider = new StaticJsonRpcProvider(localProviderUrl);

const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

function App() {

  const [ injectedProvider, setInjectedProvider ] = useState();
  if(DEBUG){console.log(injectedProvider)};
  const mainnetProvider = mainnetInfura;
  if(DEBUG){console.log("⛓️ Mainnet Infura: ",mainnetProvider)};
  const userProvider = useUserProvider(injectedProvider, localProvider);
  if(DEBUG){console.log("🧍 User Provider: ",userProvider)};
  const address = useUserAddress(userProvider);
  if(DEBUG){console.log("Current address: ", address)};
  const isSigner = injectedProvider && injectedProvider.getSigner && injectedProvider.getSigner()._isSigner
  const price = useExchangePrice(targetNetwork,mainnetProvider);
  

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  const [ loading, setLoading ] = useState()
  const [ result, setResult ] = useState()

  return (
    <div className="App">
       {/* 👨‍💼 Your account is in the top right with a wallet at connect options */}
       <div style={{textAlign: "center", padding: 10 }}>
         <Account
           connectText={"Connect Ethereum Wallet"}
           onlyShowButton={!isSigner}
           address={address}
           localProvider={localProvider}
           userProvider={userProvider}
           mainnetProvider={mainnetProvider}
           price={price}
           web3Modal={web3Modal}
           loadWeb3Modal={loadWeb3Modal}
           logoutOfWeb3Modal={logoutOfWeb3Modal}
           blockExplorer={blockExplorer}
         />
      </div>
      <div >
        <Button loading={loading} size="large" shape="round" style={{marginTop:32}} type="primary" onClick={async ()=>{
          setLoading(true)
          try{
            const msgToSign = await axios.get(serverUrl)
            console.log("msgToSign",msgToSign)
            if(msgToSign.data && msgToSign.data.length > 32){//<--- traffic escape hatch?
              let currentLoader = setTimeout(()=>{setLoading(false)},4000)
              let message = msgToSign.data.replace("**ADDRESS**",address)
              let sig = await userProvider.send("personal_sign", [ message, address ]);
              clearTimeout(currentLoader)
              currentLoader = setTimeout(()=>{setLoading(false)},4000)
              console.log("sig",sig)
              const res = await axios.post(serverUrl, {
                address: address,
                message: message,
                signature: sig,
              })
              clearTimeout(currentLoader)
              setLoading(false)
              console.log("RESULT:",res)
              if(res.data && res.data != "You must have at least one token to sign this message!"){
                setResult("hidden file contents: ",res.data)
              }
              else{
                setResult("Request denied. Do you meet the requirments?")
              }
            }else{
              setLoading(false)
              setResult("😅 Sorry, the server is overloaded. Please try again later. ⏳")
            }
          }catch(e){
            message.error(' Sorry, the server is overloaded. 🧯🚒🔥');
            console.log("FAILED TO GET...")
          }
        }}>
          Access Secret Message
        </Button>
      </div>
      <div  style={{fontSize:"18px", textAlign: "center", padding: 10 }}>
        {result}
      </div>
    </div>
  );
}

export default App;
