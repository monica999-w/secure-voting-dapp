import React, { useState, useEffect } from 'react';
import { loadBlockchainData, uploadImageToIPFS } from '../../Web3helpers';
import web3 from '../../Web3helpers';
import Sidebar from '../sidebar/Sidebar';
//import './addCandidate.css';

const AddCandidate = () => {
  const [votingSystem, setVotingSystem] = useState(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [electionId, setElectionId] = useState('');
  const [elections, setElections] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { votingSystem } = await loadBlockchainData();
      setVotingSystem(votingSystem);
      const electionCount = await votingSystem.methods.getElectionCount().call();
      const fetchedElections = [];
      for (let i = 0; i < electionCount; i++) {
        const electionDetails = await votingSystem.methods.getElectionDetails(i).call();
        fetchedElections.push({
          id: i,
          name: electionDetails[0]
        });
      }
      setElections(fetchedElections);
    };

    init();
  }, []);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const imageCID = await uploadImageToIPFS(file);
    setImage(imageCID);
  };

  const handleAddCandidate = async () => {
    try {
      const accounts = await web3.eth.getAccounts();
      const fromAddress = accounts[0];

      await votingSystem.methods
        .addCandidate(fullName, parseInt(age), description, image, parseInt(electionId))
        .send({ from: fromAddress });

      alert('Candidate added successfully!');
      setFullName('');
      setAge('');
      setDescription('');
      setImage('');
      setElectionId('');
    } catch (error) {
      console.log('Error adding candidate:', error);
      alert('Failed to add candidate. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content-container">
        <nav className="navbar">
          <h2 className="navbar-title">Add Candidate</h2>
        </nav>
        <div className="form-container">
          <form className="candidate-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name:</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="age">Age:</label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="image">Image:</label>
              <input
                type="file"
                accept="image/*"
                id="image"
                onChange={handleImageUpload}
              />
            </div>
            <div className="form-group">
              <label htmlFor="electionId">Select Election:</label>
              <select
                id="electionId"
                value={electionId}
                onChange={(e) => setElectionId(e.target.value)}
              >
                <option value="">Select Election</option>
                {elections.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="add-button" type="button" onClick={handleAddCandidate}>
              Add Candidate
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCandidate;
