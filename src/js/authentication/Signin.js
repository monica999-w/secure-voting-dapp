import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadBlockchainData } from '../../Web3helpers';
import web3 from '../../Web3helpers';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      const blockchainData = await loadBlockchainData();
      if (blockchainData && blockchainData.auth) {
        const userAddress = blockchainData.accounts;
        const userRole = await blockchainData.auth.methods.getUserRole(userAddress).call();
        setIsAdmin(userRole);
        setIsUser(!userRole);
      }
    };

    checkUserRole();
  }, []);

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

      if (isAdmin) {
        navigate('/create-election');
      } else {
        navigate('/home');
      }
    } catch (e) {
      setError('Invalid email or password');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-groupp">
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="Enter your email"
        />
      </div>
      <div className="form-groupp">
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
