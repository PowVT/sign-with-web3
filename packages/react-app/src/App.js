import React, { useCallback, useEffect, useState } from "react";
import { Button, message, Card, Row, Col, List } from "antd";
import "antd/dist/antd.css";
import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import { useUserProvider, useExchangePrice, useOnBlock } from "./hooks";
import { Account, Address } from "./components";
import { useUserAddress } from "eth-hooks";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { INFURA_ID, NETWORKS } from "./constants";
import './App.css';
import ReactHtmlParser from 'react-html-parser';

const axios = require('axios');

const DEBUG = true;

const serverUrl = "http://localhost:49832/";
const targetNetwork = NETWORKS['mainnet'];
const blockExplorer = targetNetwork.blockExplorer;

const mainnetInfura = new StaticJsonRpcProvider("https://mainnet.infura.io/v3/"+INFURA_ID)
if(DEBUG){console.log("Mainnet Infura:", mainnetInfura)};
const localProviderUrl = targetNetwork.rpcUrl;
if(DEBUG){console.log("🏠 Connecting to provider:", localProviderUrl)};
const localProvider = new StaticJsonRpcProvider(localProviderUrl);
if(DEBUG){console.log("🏠 Connecting to local provider:", localProvider)};

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

// Vimeo SDK
//let Vimeo = require('vimeo').Vimeo;
//let client = new Vimeo("{5e4b5685a66a84dd1f116c9b460ea0df3537a890}", "{+pBawidMGM1zuWg6m/1bvAO6FwHRR/MDrudqdeJvQ47KhTWMCNimtyS9L0ZGBXXQRzWtQJsbU6evpsHqe/VYH1NwcA5ViiRMm7XpHqoCPckBJRw0AYVo9NrpZge1drOg}", "{b160fd5e91c79503f49861e7bef3f67e}");

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
  if(DEBUG){console.log("price", price)};

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  const [ loading, setLoading ] = useState()
  const [ result, setResult ] = useState()
  const [ voteResult, setVoteResult ] = useState()

  const [showPoll, setShowPoll] = useState("none")
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="App">
       <Row justify="center">
       <div style={{textAlign:"center", padding: 10 }}>
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
      </Row >
      <Row justify="center" style={{margin:"24px"}}>
        <Col span={12}>
          
          <Card >
            <div >
              <Button loading={loading} size="large" shape="round" type="primary" onClick={async ()=>{
                setLoading(true) 
                try{
                  const msgToSign = await axios.get(serverUrl);
                  if(msgToSign.data && msgToSign.data.length > 32) {   //<--- traffic escape hatch?
                    let currentLoader = setTimeout(()=>{setLoading(false)},4000);
                    let message = msgToSign.data.replace("**ADDRESS**",address);
                    let sig = await userProvider.send("personal_sign", [ message, address ]);
                    clearTimeout(currentLoader);
                    currentLoader = setTimeout(()=>{setLoading(false)},4000);
                    console.log("signature: ",sig);
                    const res = await axios.post(serverUrl+"sign-in", {
                      address: address,
                      message: message,
                      signature: sig,
                    });
                    clearTimeout(currentLoader);
                    setLoading(false);
                    console.log("RESULT:",res.data);
                    if(res.data != "You must have at least one GTC to participate."){
                      setResult(res.data);
                      setShowPoll("block")
                    }
                    else{
                      setResult("Request denied. You must have at least one GTC to participate.");
                    }
                  }else{
                    setLoading(false);
                    setResult("😅 Sorry, the server is overloaded. Please try again later. ⏳");
                  }
                }catch(e){
                  message.error(' Sorry, the server is overloaded. 🧯🚒🔥');
                  console.log("FAILED TO GET...");
                }
              }}>
                Access Video
              </Button>
            </div >

            <div style={{fontSize:"24px", padding: 60 }}>
              {ReactHtmlParser(result)}
            </div>

            {/* Uncomment when want to show poll
            <div style={{display:showPoll}}>
            <Button size="large" shape="round" onClick={showModal}>
              Open Poll
            </Button>
            <Modal title="Vote" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
              { result && 
              result!="Request denied. You must have at least one GTC to participate." &&
              result!="😅 Sorry, the server is overloaded. Please try again later. ⏳" ? (
                <div style={{fontSize:"24px", width:"250px"}}>
                  <Descriptions title="Vote: " bordered>
                    <Descriptions.Item >
                    <Button 
                      size="large"
                      style={{fontSize:"20px"}}
                      onClick={async () =>{
                        const res = await axios.post(serverUrl+"cow-vote", {
                          address: address,
                        })
                        setVoteResult(res.data)
                      }}
                    >
                    🐄
                    </Button>
                    </Descriptions.Item>
                    
                    <Descriptions.Item >
                    <Button 
                    size="large"
                    style={{fontSize:"20px"}}
                    onClick={async () =>{
                      const res = await axios.post(serverUrl+"horse-vote", {
                        address: address,
                      })
                      console.log(res.data)
                      setVoteResult(res.data)
                    }}
                    >
                    🐎
                    </Button>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ) : ("")}
            </Modal>
            </div>
            */}

            <div style={{fontSize:"20px", padding: 20 }}>
              {voteResult ?
              <div > 
                Results:
                <div style={{fontSize:"18px"}}> 
                Horse Votes: {voteResult[0]}
                </div>
                <div style={{fontSize:"18px"}}> 
                Cow Votes: {voteResult[1]}
                </div>
                <div style={{fontSize:"18px"}}> 
                {console.log(voteResult[2])}
                </div>
              </div>
              : "" }
            </div>

          <div style={{fontSize:"20px", textAlign: "center", padding: 20 }}>
          {voteResult ?
            <Card title="Recent Votes">
              <List
              itemLayout="horizontal"
              dataSource={voteResult[2]}
              renderItem={item => (
                <List.Item>
                <Address
                    address={item.address}
                    ensProvider={mainnetProvider}
                    blockExplorer={blockExplorer}
                    fontSize={20}
                  /> 
                  {" "} ----> {<span style={{fontSize:"20px"}}>{item.vote}</span>}
                </List.Item>
              )}
              />
            </Card>
            : "" }
          </div>

          </Card>
        </Col>
      </Row>
      
    </div>
  );
}

export default App;
