import React, { useState, useEffect } from 'react';
import { loadBlockchainData } from '../../Web3helpers';
import web3 from '../../Web3helpers';
import Sidebar from '../sidebar/Sidebar';

const Analytics = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { auth, voterRegistration } = await loadBlockchainData();

      if (!auth || !voterRegistration) {
        throw new Error('Auth or VoterRegistration contract not found.');
      }

      const allEmails = await auth.methods.getAllUserEmails().call();
      const fetchedUsers = [];

      for (let i = 0; i < allEmails.length; i++) {
        const email = allEmails[i];
        const metamaskAddress = await auth.methods.getMetaMaskAddressByEmail(email).call();
        const cnp = await voterRegistration.methods.getCNPByEmail(email).call();
        const verified = await voterRegistration.methods.isMetamaskVerified(metamaskAddress).call();
        const username = await auth.methods.getUsernameByEmail(email).call();
        const id = i + 1;

        const truncatedMetaMaskAddress = `${metamaskAddress.substring(0, 4)}...${metamaskAddress.substring(
          metamaskAddress.length - 4
        )}`;

        const isCNPAssociated = await voterRegistration.methods.getCNPByEmail(email).call() !== '0';

        fetchedUsers.push({
          id,
          username,
          email,
          metamaskAddress: truncatedMetaMaskAddress,
          cnp,
          verified,
          isCNPAssociated,
        });
      }

      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content-container">
        <nav className="navbar">
          <h2 className="navbar-title">User Analytics</h2>
        </nav>

        <table className="candidates-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>MetaMask Address</th>
              <th>CNP</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.metamaskAddress}</td>
                <td>{user.cnp}</td>
                <td>{user.isCNPAssociated ? 'Verified' : 'Not Verified'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;
