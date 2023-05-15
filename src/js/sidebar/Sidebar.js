import React from "react";
import { Link } from "react-router-dom";
import { FaUserCircle,FaUser,FaEdit,FaUserPlus,FaChartBar,FaSignOutAlt, FaVoteYea,FaThLarge, FaPlus, FaChartLine, FaPowerOff } from "react-icons/fa";
import "./sidebar.css";
import web3 from "../../Web3helpers";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");
  const account = localStorage.getItem("account");
  const metamaskAddress = web3.currentProvider.selectedAddress;
  const truncatedAddress = metamaskAddress ? `${metamaskAddress.slice(0, 6)}...${metamaskAddress.slice(-4)}` : '';

  return (
    <div className="sidebar">
      <div className="sidebarheader">
        <div className="profile-pic">
          <FaUserCircle size={40} />
        </div>
        <div className="profile-info">
          <p>{email}</p>
          <p>{truncatedAddress}</p>
        </div>
      </div>
      <div className="sidebar-menu">
        <Link to="/candidates">
          <FaUser size={30} />
          <span>Candidates Details</span>
        </Link>
        <Link to="/add-candidate">
          <FaPlus size={30} />
          <span>Add Candidate</span>
        </Link>
        <Link to="/analytics">
          <FaChartLine size={30} />
          <span>Analytics</span>
        </Link>
        <Link to="/create-election">
          <FaEdit size={30} />
          <span>Create Election</span>
        </Link>
        <Link to="/election-details">
          <FaVoteYea size={30} />
          <span>Election Details</span>
        </Link>
        <Link to="/voter-register">
          <FaUserPlus size={30} />
          <span>Voter Register</span>
        </Link>
        <Link to="/voting-area">
          <FaVoteYea size={30} />
          <span>Voting Area</span>
        </Link>
        <Link to="/results">
          <FaChartBar size={30} />
          <span>Results</span>
        </Link>
        <Link to="/" onClick={() => localStorage.clear()}>
          <FaSignOutAlt size={30} />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
