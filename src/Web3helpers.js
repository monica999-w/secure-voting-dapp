import Web3 from 'web3';
import Auth from './build/contracts/Auth.json';

export const loadWeb3 = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      return web3;
    } else if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider);
      return web3;
    } else {
      window.alert(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
      return null;
    }
  };

  const web3 = new Web3(window.ethereum || 'http://localhost:8545');

  export default web3;
  
  export const loadBlockchainData = async () => {
    const web3 = await loadWeb3();
    if (!web3) return null;
    
    const accounts = await web3.eth.getAccounts();
    const networkId = await web3.eth.net.getId();
  
    if (Auth.networks[networkId]) {
      const auth = new web3.eth.Contract(Auth.abi, Auth.networks[networkId].address);
      return { auth, accounts: accounts[0] };
    }
  };