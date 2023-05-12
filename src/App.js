import "./App.css";
import React from 'react';
import StartPage from './js/StartPage';
import SignIn from './js/Signin';
import SignUp from './js/Signup';
import Home from './js/Home';
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
</Routes>
</BrowserRouter>
</div>
);
}

export default App;