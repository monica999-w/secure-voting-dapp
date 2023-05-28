import React, { useState, useEffect } from 'react';
import { loadBlockchainData } from '../../Web3helpers';
import Sidebar from '../sidebar/Sidebar';
import '../../css/candidatesPage.css';
import { useParams } from 'react-router-dom';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CandidatesPage = () => {
  const { electionId } = useParams();
  const [votingSystem, setVotingSystem] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [electionName, setElectionName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { votingSystem } = await loadBlockchainData();
      setVotingSystem(votingSystem);
      const electionDetails = await votingSystem.methods.getElectionDetails(parseInt(electionId)).call();
      setElectionName(electionDetails[1]);
    };

    init();
  }, [electionId]);

  useEffect(() => {
    if (votingSystem) {
      const fetchCandidates = async () => {
        const candidateCount = await votingSystem.methods.getCandidateCount().call();
        const fetchedCandidates = [];

        for (let i = 0; i < candidateCount; i++) {
          const candidateDetails = await votingSystem.methods.getCandidateDetails(i).call();
          const candidateElectionId = parseInt(candidateDetails[4]);

          if (candidateElectionId === parseInt(electionId)) {
            const formattedCandidateDetails = {
              id: i,
              fullName: candidateDetails[0],
              age: parseInt(candidateDetails[1]),
              description: candidateDetails[2],
              image: candidateDetails[3],
              electionId: candidateElectionId,
            };

            fetchedCandidates.push(formattedCandidateDetails);
          }
        }

        setCandidates(fetchedCandidates);
        setFilteredCandidates(fetchedCandidates);
      };

      fetchCandidates();
    }
  }, [votingSystem, electionId]);

  const handleSearch = () => {
    if (searchTerm === '') {
      setFilteredCandidates(candidates); 
    } else {
      const filteredCandidates = candidates.filter(candidate =>
        candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCandidates(filteredCandidates);
    }
  };

  useEffect(() => {
    setFilteredCandidates(candidates); 
  }, [candidates]);

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content">
        <nav className="navbar-candidate">
          <div className="navbar-container">
            <FaArrowLeft className="back-arrow" onClick={() => navigate('/voting-area')} />
            <h2 className="navbar-title">{electionName}</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
              />
              <button className="search-button" onClick={handleSearch}>
                <FaSearch className="search-icon" />
              </button>
            </div>
          </div>
        </nav>
        <div className="candidates-container">
          {filteredCandidates.length > 0 ? (
            filteredCandidates.map(candidate => (
              <div className="candidate-item" key={candidate.id}>
                <div className="candidate-item-group">
                  <div className="candidate-image">
                    {candidate.image && <img src={`https://ipfs.io/ipfs/${candidate.image}`} alt="Candidate" />}
                  </div>
                  <div className="candidate-details">
                    <h2>{candidate.fullName}</h2>
                    <p>Age: {candidate.age}</p>
                  </div>
                </div>
                <p className="candidate-description">Description: {candidate.description}</p>
              </div>
            ))
          ) : (
            <p>No candidates available for this election.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidatesPage;
