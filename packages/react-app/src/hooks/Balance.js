import { useState, useCallback } from "react";
import usePoller from "./Poller";


/*
  ~ What it does? ~
  Gets your balance in ETH from given address and provider
  ~ How can I use? ~
  const yourLocalBalance = useBalance(localProvider, address);
  ~ Features ~
  - Provide address and get balance corresponding to given address
  - Change provider to access balance on different chains (ex. mainnetProvider)
  - If no pollTime is passed, the balance will update on every new block
*/

let DEBUG = true

export default function useBalance(provider, address, pollTime = 3000) {

const [balance, setBalance] = useState();

// Use a poller if a pollTime is provided
usePoller(async () => {
  if (provider && address && pollTime > 0) {

    if (DEBUG) {console.log('polling!', address, provider)};

    if (provider && address) {
      const newBalance = await provider.getBalance(address);
      if (newBalance !== balance) {
        setBalance(newBalance);
      }
    }
  }
}, pollTime, provider && address)

return balance;
}