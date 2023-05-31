import Web3 from 'web3';
import Auth from './build/contracts/Auth.json';
import VotingSystem from './build/contracts/VotingSystem.json';
import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Configure IPFS connection
const ipfs = create({
  host: 'ipfs.infura.io',
  port: '5001',
  protocol: 'https',
  headers: {
    authorization: 'Basic ' + Buffer.from('2Q8mRArm7eh3HyX0yIrXa7HkSsI:e0965b5f20a8a7c829f968769e50091f').toString('base64')
  }
});

export const uploadImageToIPFS = async (imageFile) => {
  try {
    const imageBuffer = await imageFile.arrayBuffer();
    const imageResult = await ipfs.add(imageBuffer);
    const imageCID = imageResult.cid.toString();
    return imageCID;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw error;
  }
};

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

  let auth, votingSystem;

  if (Auth.networks[networkId]) {
    auth = new web3.eth.Contract(Auth.abi, Auth.networks[networkId].address);
  }

  if (VotingSystem.networks[networkId]) {
    votingSystem = new web3.eth.Contract(
      VotingSystem.abi,
      VotingSystem.networks[networkId].address
    );
  }

  return {
    auth,
    votingSystem,
    accounts: accounts[0],
    logout: async () => {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = VotingSystem.networks[networkId];
      const votingSystem = new web3.eth.Contract(
        VotingSystem.abi,
        deployedNetwork && deployedNetwork.address
      );

      await votingSystem.methods.logout().send({ from: accounts[0] });
    },
  };
};
