import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle, FaUserCheck, FaUser, FaCheckCircle, FaEdit, FaUserPlus, FaChartBar, FaSignOutAlt, FaVoteYea, FaThLarge, FaRegClipboard, FaPlus, FaChartLine } from 'react-icons/fa';
import '../../css/sidebar.css';
import web3, { loadBlockchainData } from '../../Web3helpers';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const account = localStorage.getItem('account');
  const metamaskAddress = web3.currentProvider.selectedAddress;
  const truncatedAddress = metamaskAddress ? `${metamaskAddress.slice(0, 6)}...${metamaskAddress.slice(-4)}` : '';

  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isUser, setIsUser] = React.useState(false);
  const location = useLocation();

  React.useEffect(() => {
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

  const handleLogout = async () => {
    const blockchainData = await loadBlockchainData();
    if (blockchainData && blockchainData.logout) {
      await blockchainData.logout();
    }
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className={`sidebar ${isAdmin ? 'admin' : ''}`}>
      <div className="sidebar-header">
        <div className="profile-pic">
          <FaUserCircle size={40} />
        </div>
        <div className="profile-info">
          {isUser && <p>{email}</p>}
          {isAdmin && <p>{truncatedAddress}</p>}
        </div>
      </div>
      <div className="sidebar-menu">
        {isAdmin && (
          <>
            <Link to="/candidates">
              <FaUser size={30} />
              <span>Candidates Details</span>
            </Link>

            <Link to="/add-candidate" className={location.pathname === '/add-candidate' ? 'active' : ''}>
              <FaPlus size={30} />
              <span>Add Candidate</span>
            </Link>

            <Link to="/create-election" className={location.pathname === '/create-election' ? 'active' : ''}>
              <FaEdit size={30} />
              <span>Create Election</span>
            </Link>

            <Link to="/analytics">
              <FaChartLine size={30} />
              <span>Analytics</span>
            </Link>
          </>
        )}
        {isUser && (
          <>
            <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>
              <FaRegClipboard size={30} />
              <span>Information</span>
            </Link>
            <Link to="/voter-register" className={location.pathname === '/voter-register' ? 'active' : ''}>
              <FaUserCheck size={30} />
              <span>Voter Registration</span>
            </Link>
            <Link to="/voting-area" className={location.pathname === '/voting-area' ? 'active' : ''}>
              <FaVoteYea size={30} />
              <span>Voting-Area</span>
            </Link>
            <Link to="/results" className={location.pathname === '/results' ? 'active' : ''}>
              <FaChartBar size={30} />
              <span>Results</span>
            </Link>
          </>
        )}
        <Link to="/" onClick={handleLogout}>
          <FaSignOutAlt size={30} />
          <span>Log Out</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
