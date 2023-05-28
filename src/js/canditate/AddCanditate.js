import React, { useState, useEffect } from 'react';
import { loadBlockchainData, uploadImageToIPFS } from '../../Web3helpers';
import web3 from '../../Web3helpers';
import Sidebar from '../sidebar/Sidebar';
import '../../css/addCandidate.css';

const AddCandidate = () => {
  const [votingSystem, setVotingSystem] = useState(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [electionId, setElectionId] = useState('');
  const [elections, setElections] = useState([]);
  const [activeElections, setActiveElections] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { votingSystem } = await loadBlockchainData();
      setVotingSystem(votingSystem);
      const electionCount = await votingSystem.methods.getElectionCount().call();
      const fetchedElections = [];
      const activeElections = [];
      for (let i = 0; i < electionCount; i++) {
        const electionDetails = await votingSystem.methods.getElectionDetails(i).call();
        const endDate = parseInt(electionDetails[5]);
        const isActive = endDate > Math.floor(Date.now() / 1000);

        const election = {
          id: parseInt(electionDetails[0]),
          name: electionDetails[1],
          isActive: isActive
        };

        fetchedElections.push(election);

        if (isActive) {
          activeElections.push(election);
        }
      }

      setElections(fetchedElections);
      setActiveElections(activeElections);
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
      
      if (age < 18 || age > 65) {
        alert('Age must be between 18 and 65 years.');
        return;
      }

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
              <div className="input">
              <input
                type="text"
                id="fullName"
                placeholder="Candidate's Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
               </div>
            </div>

            <div className="form-group">
               <div className="input-group">
              <input
                type="number"
                id="age"
                placeholder="Candidate's Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min={18}
                max={65}
              />
              </div>
              <div className="input-group">
              <input
                type="file"
                accept="image/*"
                id="image"
                onChange={handleImageUpload}
              />
              </div>
            </div>
            <div className="form-group">
               <div className="input">
             
              <input
                type="text"
                id="description"
                placeholder="Description of the Candidate"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              </div>
            </div>
            
            <div className="form-group">
            <div className="input-select">
              {activeElections.length > 0 ? (
                <select
                  id="electionId"
                  value={electionId}
                  onChange={(e) => setElectionId(e.target.value)}
                  className="election-type-select"
                >
                  <option value="">Choose Election</option>
                  {activeElections.map((election) => (
                    <option key={election.id} value={election.id}>
                      {election.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p>No active elections</p>
              )}
            </div>
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
