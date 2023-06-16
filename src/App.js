import "./App.css";
import React, { useState, useEffect } from 'react';
import StartPage from './js/authentication/StartPage';
import SignIn from './js/authentication/Signin';
import SignUp from './js/authentication/Signup';
import Home from './js/Home';
import AddCandidate from './js/canditate/AddCanditate';
import AddElection from './js/election/AddElection';
import DetailsElection from './js/election/DetailsElection';
import DetailCandidates from './js/canditate/DetailCandidates';
import CandidatesPage from './js/canditate/CandidatesPage';
import Rezult from './js/voter/Rezult';
import Analytics from './js/voter/Analytics';
import VoterRegistration from './js/voter/VoterRegistration';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { loadBlockchainData } from "./Web3helpers";


function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      const blockchainData = await loadBlockchainData();
      if (blockchainData && blockchainData.auth) {
        const userAddress = blockchainData.accounts;
        const userRole = await blockchainData.auth.methods.getUserRole(userAddress).call();
        setIsAdmin(userRole === true);
        setIsUser(userRole === false);
      }
    };

    checkUserRole();
  }, []);

  const email = localStorage.getItem('email');

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
        <Route exact path="/" element={<StartPage />} />
        <Route path="/Signin" element={<SignIn />} />
        <Route path="/Signup" element={<SignUp />} />
        <Route path="/voter-register" element={<VoterRegistration />} />

          {isAdmin && email && <Route path="/" element={<Navigate to="/create-election" />} />}
          {isAdmin && (
            <Route path="/create-election" element={<AddElection />} />
          )}
          {isAdmin && (
            <Route path="/add-candidate" element={<AddCandidate />} />
          )}
          {isAdmin && (
            <Route path="/candidates" element={<DetailCandidates />} />
          )}
          {isAdmin && (
            <Route path="/analytics" element={<Analytics />} />
          )}

          {isUser && email && <Route path="/" element={<Navigate to="/home" />} />}
          {isUser && (
            <Route path="/home" element={<Home />} />
          )}
          {isUser && (
            <Route path="/voting-area" element={<DetailsElection />} />
          )}
          {isUser && (
            <Route path="/candidates/:electionId" element={<CandidatesPage />} />
          )}
          {isUser && (
            <Route path="/results" element={<Rezult />} />
          )}
           
            
          
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
