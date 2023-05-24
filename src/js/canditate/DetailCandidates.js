import React, { useState, useEffect } from 'react';
import { loadBlockchainData } from '../../Web3helpers';
import Sidebar from '../sidebar/Sidebar';
//import './detailCandidates.css';

const DetailCandidates = () => {
  const [votingSystem, setVotingSystem] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [activeElections, setActiveElections] = useState([]);

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

          if (isElectionActive(electionId)) {
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
        }

        setCandidates(fetchedCandidates);
      };

      const isElectionActive = (electionId) => {
        return activeElections.some((election) => election.id === electionId && election.isActive);
      };

      fetchCandidates();
    }
  }, [votingSystem, activeElections]);

  useEffect(() => {
    if (votingSystem) {
      const fetchActiveElections = async () => {
        const electionCount = await votingSystem.methods.getElectionCount().call();
        const activeElections = [];

        for (let i = 0; i < electionCount; i++) {
          const electionDetails = await votingSystem.methods.getElectionDetails(i).call();
          const endDate = parseInt(electionDetails[4]);
          const isActive = endDate > Math.floor(Date.now() / 1000);

          const election = {
            id: i,
            name: electionDetails[0],
            isActive: isActive,
          };

          if (isActive) {
            activeElections.push(election);
          }
        }

        setActiveElections(activeElections);
      };

      fetchActiveElections();
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
            <p>No candidates in active elections</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailCandidates;
