import "./App.css";
import React from 'react';
import StartPage from './js/authentication/StartPage';
import SignIn from './js/authentication/Signin';
import SignUp from './js/authentication/Signup';
import Home from './js/Home';
import AddCandidate from './js/canditate/AddCanditate';
import AddElection from './js/election/AddElection';
import DetailsElection from './js/election/DetailsElection';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const email = localStorage.getItem('email');
return (
<div className="App">
<BrowserRouter>
<Routes>
<Route exact path="/" element={<StartPage />} />
<Route path="/Signin" element={<SignIn />} />
<Route path="/Signup" element={<SignUp />} />
<Route path="/Home" element={email ? <Home /> : <Navigate to="/" />} />
<Route path="/add-candidate" element={<AddCandidate />} />
<Route path="/voting-area" element={<DetailsElection />} />
<Route path="/create-election" element={ email ? <AddElection /> : <Navigate to= "/" /> } />
</Routes>
</BrowserRouter>
</div>
);
}

export default App;