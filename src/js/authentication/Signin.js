import React, { useState } from 'react';
import { loadBlockchainData } from '../../Web3helpers';
import web3 from '../../Web3helpers';
import { useNavigate } from 'react-router-dom';
import "../../css/authen.css";


const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { auth, accounts } = await loadBlockchainData();
    try {
      await auth.methods.login(email, web3.utils.sha3(password)).send({ from: accounts });
      localStorage.setItem('email', email);
      navigate('/home');
  
    } catch (e) {
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter your email"
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Enter your password"
        />
      </div>
      {error && <p>{error}</p>}
      <button type="submit" className="btn">
        Sign in
      </button>
    </form>
  );
};
export default Signin;