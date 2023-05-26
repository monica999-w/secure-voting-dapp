import React, { useState, useEffect } from 'react';
import { loadBlockchainData } from '../../Web3helpers';
import Sidebar from '../sidebar/Sidebar';
//import './detailCandidates.css';

const DetailCandidates = ({ match }) => {
  const [votingSystem, setVotingSystem] = useState(null);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { votingSystem } = await loadBlockchainData();
      setVotingSystem(votingSystem);
    };

    init();
  }, []);

  useEffect(() => {
    if (votingSystem) {
      const fetchCandidates = async () => {
        const candidateCount = await votingSystem.methods.getCandidateCount().call();
        const fetchedCandidates = [];

        for (let i = 0; i < candidateCount; i++) {
          const candidateDetails = await votingSystem.methods.getCandidateDetails(i).call();
          const electionId = parseInt(candidateDetails[4]);

          const formattedCandidateDetails = {
            id: i,
            fullName: candidateDetails[0],
            age: parseInt(candidateDetails[1]),
            description: candidateDetails[2],
            image: candidateDetails[3],
            electionId: electionId,
          };

          fetchedCandidates.push(formattedCandidateDetails);
        }

        setCandidates(fetchedCandidates);
      };

      fetchCandidates();
    }
  }, [votingSystem]);

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content-container">
        <nav className="navbar">
          <h2 className="navbar-title">Candidate Details</h2>
        </nav>
        <div className="candidates-container">
          {candidates.length > 0 ? (
            candidates.map((candidate, index) => (
              <div className="candidate-item" key={index}>
                <h2>{candidate.fullName}</h2>
                <p>Age: {candidate.age}</p>
                <p>Description: {candidate.description}</p>
                {candidate.image && <img src={`https://ipfs.io/ipfs/${candidate.image}`} alt="Candidate" />}
              </div>
            ))
          ) : (
            <p>No candidates available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailCandidates;
