import React, { useState } from 'react';
import { loadBlockchainData } from '../../Web3helpers';

const AddCandidate = ({ electionId }) => {
  const [candidateName, setCandidateName] = useState('');

  const handleCandidateNameChange = (event) => {
    setCandidateName(event.target.value);
  };

  const handleAddCandidate = async () => {
    const { contract, accounts } = await loadBlockchainData();
    await contract.methods.addCandidate(electionId, candidateName).send({ from: accounts[0] });
    // Add logic to handle success or error
  };

  return (
    <div>
      <h2>Add Candidate</h2>
      <label>Candidate Name:</label>
      <input type="text" value={candidateName} onChange={handleCandidateNameChange} />
      <button onClick={handleAddCandidate}>Add Candidate</button>
    </div>
  );
};

export default AddCandidate;
