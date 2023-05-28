import React, { useState } from 'react';
import { loadBlockchainData } from '../../Web3helpers';
import web3 from '../../Web3helpers';
import { useNavigate } from 'react-router-dom';
import "../../css/authen.css"


const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { auth, accounts } = await loadBlockchainData();
    try {
      await auth.methods.createAccount(username, email, web3.utils.sha3(password), web3.utils.sha3(confirmPassword)).send({ from: accounts });
      navigate('/');
    } catch (e) {
      setError('Invalid input');
    }
  };

  return (
<form onSubmit={handleSubmit} className="form">
    <div className="form-groupp">
      <input
        type="text"
        value={username}
        onChange={handleUsernameChange}
        placeholder="Enter your username"
        className="form-input"
        required
      />
    </div>
    <div className="form-groupp">
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="Enter your email"
        className="form-input"
        required
      />
    </div>
    <div className="form-groupp">
      <input
        type="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Enter your password"
        className="form-input"
        required
      />
    </div>
    <div className="form-groupp">
      <input
        type="password"
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        placeholder="Confirm your password"
        className="form-input"
        required
      />
    </div>
    {error && <p>{error}</p>}
    <button type="submit" className="btn">Signup</button>

  </form>
);
};
export default Signup;
