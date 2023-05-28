import React, { useState, useEffect } from 'react';
import { loadBlockchainData } from '../../Web3helpers';
import web3 from '../../Web3helpers';
import Sidebar from '../sidebar/Sidebar';
import '../../css/addElection.css';
import { FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AddElection = () => {
  const [votingSystem, setVotingSystem] = useState(null);
  const [name, setName] = useState('');
  const [electionType, setElectionType] = useState('');
  const [organizedBy, setOrganizedBy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();
  

  useEffect(() => {
    const init = async () => {
      const { votingSystem } = await loadBlockchainData();
      setVotingSystem(votingSystem);
    };

    init();
  }, []);

  const handleAddElection = async () => {
    try {
      const startTimestamp = new Date(startDate).getTime() / 1000; // Convert milliseconds to seconds
      const endTimestamp = new Date(endDate).getTime() / 1000; // Convert milliseconds to seconds

      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      await votingSystem.methods
        .addElection(name, electionType, organizedBy, startTimestamp, endTimestamp)
        .send({ from: fromAddress });

      alert('Election added successfully!');
      setName('');
      setElectionType('');
      setOrganizedBy('');
      setStartDate('');
      setEndDate('');
       // Redirect to add-candidate page
       navigate('/add-candidate');
      } catch (error) {
        console.log('Error adding election:', error);
        alert('Failed to add election. Please try again.');
      }
    };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content-container">
        <nav className="navbar">
          <h2 className="navbar-title">Create Election</h2>
        </nav>
        <div className="form-container">
          <form className="election-form">
            <div className="form-groups">
              <div className="input-group">
                <input
                  type="text"
                  id="name"
                  placeholder="Enter Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  id="organizedBy"
                  placeholder="Enter Organized By"
                  value={organizedBy}
                  onChange={(e) => setOrganizedBy(e.target.value)}
                />
              </div>
            </div>
            <div className="form-groups">
              <div className="input-select">
                <select
                  id="electionType"
                  value={electionType}
                  onChange={(e) => setElectionType(e.target.value)}
                  className="election-type-select"
                >
                  <option value="">Select Type</option>
                  <option value="0">Political</option>
                  <option value="1">Corporation</option>
                  <option value="2">Academics</option>
                </select>
              </div>
            </div>
            <div className="form-groups">
              <div className="input-group">
                <label htmlFor="startDate">
                  <FaCalendarAlt className="icon" /> Start Date:
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  placeholder="Select Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="endDate">
                  <FaCalendarAlt className="icon" /> End Date:
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  placeholder="Select End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="button-container">
              <button className="add-button" type="button" onClick={handleAddElection}>
                <span>Add Election</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddElection;
