import React, { useState, useEffect } from 'react';
import { loadBlockchainData } from '../../Web3helpers';
import Sidebar from '../sidebar/Sidebar';
import './detailsElection.css';
import politicalImage from '../../img/political.png';
import corporationImage from '../../img/corporation.png';
import academicsImage from '../../img/academics.png';
import { format } from 'date-fns';


const DetailsElection = () => {
  const [votingSystem, setVotingSystem] = useState(null);
  const [elections, setElections] = useState([]);
  

const getElectionImage = (type) => {
  switch (parseInt(type)) {
    case 0:
      return politicalImage;
    case 1:
      return corporationImage;
    case 2:
      return academicsImage;
    default:
      return '';
  }
};

const viewCandidatesDetails = async (electionIndex) => {
  const candidatesDetails = await votingSystem.methods.getCandidatesDetails(electionIndex).call();
  console.log(candidatesDetails);
};


  useEffect(() => {
    const init = async () => {
      const { votingSystem } = await loadBlockchainData();
      setVotingSystem(votingSystem);
    };

    init();
  }, []);

  useEffect(() => {
    if (votingSystem) {
      const fetchElections = async () => {
        const electionCount = await votingSystem.methods.getElectionCount().call();
        const fetchedElections = [];
        for (let i = 0; i < electionCount; i++) {
          const electionDetails = await votingSystem.methods.getElectionDetails(i).call();
          const formattedElectionDetails = {
            name: electionDetails[0],
            electionType: electionDetails[1],
            organizedBy: electionDetails[2],
            startDate: new Date(electionDetails[3] * 1000).toLocaleDateString(),
            endDate: new Date(electionDetails[4] * 1000).toLocaleDateString(),
          };
          fetchedElections.push(formattedElectionDetails);
        }
        setElections(fetchedElections);
      };

      fetchElections();
    }
  }, [votingSystem]);

 

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content-container">
        <nav className="navbar">
          <h2 className="navbar-title">Area Voter</h2>
        </nav>
        <div className="elections-container">
          {elections.map((election, index) => (
            <div className="election-item" key={index}>
              <h2>{election.name}</h2>
              <p>  {election.startDate} - {election.endDate}</p>
              <img
                  src={getElectionImage(election.electionType)}
                  alt={`Election ${index + 1}`}
                  className="election-image"
                />
                <button
                    onClick={() => viewCandidatesDetails(index)}
                    className="view-candidates-button"
                  >
                    View Candidates
                  </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailsElection;
