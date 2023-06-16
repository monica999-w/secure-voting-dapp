import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { loadBlockchainData } from '../../Web3helpers';
import web3 from '../../Web3helpers';
import Sidebar from '../sidebar/Sidebar';
import countyMap from './counties';
import '../../css/voterRegistration.css';
import verificationImage from '../../img/online-voting.png';
import kycImage from '../../img/kyc-verifying-circle.gif';

const VoterRegistration = () => {
  const [metamaskAddress, setMetamaskAddress] = useState('');
  const [cnp, setCNP] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredVerificationCode, setEnteredVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [isAccountAssociated, setIsAccountAssociated] = useState(false);

  const getCNPByMetaMaskAddress = async (metamaskAddress) => {
    try {
      const { voterRegistration } = await loadBlockchainData();
      const cnp = await voterRegistration.methods.getCNPByEmail(metamaskAddress).call();
      return cnp;
    } catch (error) {
      throw new Error('Failed to fetch CNP for MetaMask address');
    }
  };

  const updateURLParams = (isVerified) => {
    const url = new URL(window.location);
    url.searchParams.set('isAccountVerified', isVerified ? 'true' : 'false');
    window.history.replaceState(null, '', url.toString());
  };

  useEffect(() => {
    const url = new URL(window.location);
    const isVerifiedParam = url.searchParams.get('isAccountVerified');
    const isVerified = isVerifiedParam === 'true';
    setIsAccountVerified(isVerified);
    setIsAccountAssociated(isVerified);
  }, []);

  const handleVerifyMetamaskAddress = async () => {
    try {
      setLoading(true);
      setError(null);

      const { auth, voterRegistration } = await loadBlockchainData();
      if (!auth || !voterRegistration) {
        throw new Error('Auth or VoterRegistration contract not found.');
      }

      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];

      // Verify if the entered MetaMask address matches the address associated with the account
      if (userAddress.toLowerCase() !== metamaskAddress.toLowerCase()) {
        throw new Error('Invalid MetaMask address.');
      }

      // Check if the CNP is already associated with an email
      const cnpFromContract = await voterRegistration.methods.getCNPByEmail(email).call();
      if (cnpFromContract !== '0') {
        throw new Error('CNP already associated with an email.');
      }

      // Validate CNP format
      const cnpRegex = /^(1|2|3|4|5|6)\d{12}$/;
      if (!cnpRegex.test(cnp)) {
        throw new Error('Invalid CNP format.');
      }

      const isMetamaskVerified = await voterRegistration.methods.isMetamaskVerified(userAddress).call();
      setIsAccountVerified(isMetamaskVerified);
      updateURLParams(isMetamaskVerified);

      setEmail(await auth.methods.getUserEmail(userAddress).call());

      // Check if the CNP is associated with the MetaMask address
      const isCNPAssociated = await voterRegistration.methods.isAddressVerified(userAddress).call();
      setIsAccountAssociated(isCNPAssociated);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    try {
      setLoading(true);
      setError(null);

      const { voterRegistration } = await loadBlockchainData();
      if (!voterRegistration) {
        throw new Error('Voter Registration contract not found.');
      }

      if (!cnp || !email) {
        throw new Error('CNP and email are required.');
      }

      // Check if the CNP is already associated with an address
      const addressFromContract = await voterRegistration.methods.getMetaMaskAddressByCNP(parseInt(cnp)).call();
      if (addressFromContract !== '0x0000000000000000000000000000000000000000') {
        throw new Error('CNP already associated with an address.');
      }

      // Generate a random verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      await axios.post('http://localhost:3000/voter-register', {
        to: email,
        subject: 'Email Verification',
        text: `Your verification code is: ${verificationCode}`,
      });

      setVerificationCode(verificationCode);
      setIsCodeSent(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (enteredVerificationCode === verificationCode) {
      setIsCodeVerified(true);

      try {
        setLoading(true);
        setError(null);

        const { voterRegistration } = await loadBlockchainData();
        if (!voterRegistration) {
          throw new Error('Voter Registration contract not found.');
        }

        const accounts = await web3.eth.getAccounts();
        const userAddress = accounts[0];

        await voterRegistration.methods.verifyMetaMaskAddress(userAddress, parseInt(cnp)).send({ from: userAddress });
        setIsAccountVerified(true);
        updateURLParams(true);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Invalid verification code');
    }
  };

  const extractBirthDate = () => {
    let year = parseInt(cnp.substring(1, 3));
    const month = parseInt(cnp.substring(3, 5));
    const day = parseInt(cnp.substring(5, 7));
    const century = parseInt(cnp.charAt(0));

    if (century === 1 || century === 2) {
      year += 1900;
    } else if (century === 3 || century === 4) {
      year += 1800;
    } else if (century === 5 || century === 6) {
      year += 2000;
    }

    return new Date(year, month - 1, day);
  };

  const extractGender = () => {
    const genderDigit = parseInt(cnp.charAt(0));
    return genderDigit % 2 === 0 ? 'Female' : 'Male';
  };

  const extractCounty = () => {
    const countyCode = parseInt(cnp.substring(7, 9));
    return countyMap[countyCode] || 'Unknown';
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="page-container">
      <Sidebar />
      {isAccountVerified ? (
        <div className="center-container">
          <h1 className="success-message">Account verified successfully!</h1>
          <p className="success-message">
            You are now ready to exercise your right to vote and choose the candidate of your choice.
          </p>
          <img src={verificationImage} alt="Verification" className="verification-image" />
        </div>
      ) : (
        <div className="content-container">
          <nav className="navbar-voter">
            <h2 className="navbar-title">Voter Registration</h2>
          </nav>
          <div className="form-container">
            <form className="voter-form">
              <div className="form-group">
                <img src={kycImage} alt="KYC Verifying" className="verificationKYC" />
                <div className="input">
                  <input
                    type="text"
                    id="metamask-address"
                    placeholder="MetaMask Address"
                    value={metamaskAddress}
                    onChange={(e) => setMetamaskAddress(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <div className="input-CNP">
                  <input
                    type="number"
                    id="cnp"
                    placeholder="CNP"
                    value={cnp}
                    onChange={(e) => setCNP(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <button className="verify-button" onClick={handleVerifyMetamaskAddress} disabled={loading}>
                  Verify
                </button>
              </div>
              {email && (
                <div className="form-group">
                  <label>Email:</label>
                  <input type="text" value={email} disabled />
                </div>
              )}
              {email && !isCodeSent && (
                <div className="form-group">
                  <button className="send-code-button" onClick={handleSendVerificationCode} disabled={loading}>
                    Send Verification Code
                  </button>
                </div>
              )}
              {isCodeSent && (
                <div className="form-group">
                  <label>Verification Code:</label>
                  <input
                    type="text"
                    value={enteredVerificationCode}
                    onChange={(e) => setEnteredVerificationCode(e.target.value)}
                  />
                  <button className="verify-code-button" onClick={handleVerifyCode} disabled={loading}>
                    Verify Code
                  </button>
                </div>
              )}
              {error && <p className="error-message">Error: {error}</p>}
              {/* {isCodeVerified && (
                // <div className="user-info-container">
                //   <p>Date of Birth: {extractBirthDate().toLocaleDateString()}</p>
                //   <p>Gender: {extractGender()}</p>
                //   <p>County: {extractCounty()}</p>
                //   <p>Age: {calculateAge(extractBirthDate())}</p>
                // </div>
              )} */}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoterRegistration;
