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
          <Route path="/Home" element={email ? <Home isAdmin={isAdmin} isUser={isUser} /> : <Navigate to="/" />} />
          {isAdmin && (
            <Route path="/add-candidate" element={<AddCandidate />} />
          )}
          {isAdmin && (
            <Route path="/candidates" element={<DetailCandidates />} />
          )}
          {isAdmin && (
            <Route path="/create-election" element={<AddElection />} />
          )}
          {isUser && (
            <Route path="/voting-area" element={<DetailsElection />} />
          )}
          
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
