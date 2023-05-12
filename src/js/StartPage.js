import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import LoginForm from './Signin';
import SignupForm from './Signup';
import '../css/startPage.css';

function StartPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  const handleToggleSignIn = () => {
    setIsSignIn(!isSignIn);
  };

  return (
    <div className="container">
      <div className="image"></div>
      <div className="login-container">
        <h2 className="login-message"> ONLINE VOTING</h2>
        <p className="info">
        Our app provides a secure and transparent way for voters to cast their votes. 
        Please login to get started.{' '}
        </p>
        {isSignIn ? (
          <LoginForm />
        ) : (
          <SignupForm handleToggleSignIn={handleToggleSignIn} />
        )}
        <Link onClick={handleToggleSignIn} className="signup-link" to="#">
        {isSignIn ? "Don't have an account?" : "Already have an account?"}
        </Link>
      </div>
    </div>
  );
}

export default StartPage;
