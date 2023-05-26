import React, { useState, useEffect } from 'react';
import { loadBlockchainData } from '../../Web3helpers';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import '../../css/detailsElection.css';
import politicalImage from '../../img/political.png';
import corporationImage from '../../img/corporation.png';
import academicsImage from '../../img/academics.png';
import { format, differenceInSeconds } from 'date-fns';

const DetailsElection = () => {
  const { electionId } = useParams();
  const [votingSystem, setVotingSystem] = useState(null);
  const [activeElections, setActiveElections] = useState([]);

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

  useEffect(() => {
    const init = async () => {
      const { votingSystem } = await loadBlockchainData();
      setVotingSystem(votingSystem);
    };

    init();
  }, []);

  useEffect(() => {
    if (votingSystem) {
      const fetchActiveElections = async () => {
        const activeElections = await votingSystem.methods.getActiveElections().call();
        const currentTimestamp = Math.floor(Date.now() / 1000);

        const formattedActiveElections = activeElections.map((election) => {
          const endDate = parseInt(election.endDate);
          const remainingTime = endDate > currentTimestamp ? endDate - currentTimestamp : 0;

          return {
            ...election,
            remainingTime,
          };
        });

        setActiveElections(formattedActiveElections);
      };

      fetchActiveElections();

      const interval = setInterval(fetchActiveElections, 1000); // Actualizează alegerile active la fiecare secundă

      return () => {
        clearInterval(interval);
      };
    }
  }, [votingSystem]);

  const formatRemainingTime = (remainingTime) => {
    if (remainingTime <= 0) {
      return 'Election has ended';
    }

    const days = Math.floor(remainingTime / (60 * 60 * 24));
    const hours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
    const seconds = remainingTime % 60;

    return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  console.log('electionId:', electionId); // Verifică valoarea electionId în consolă

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content-container">
        <nav className="navbar">
          <h2 className="navbar-title">Area Voter</h2>
        </nav>
        <div className="elections-container">
          {activeElections.map((election, index) => (
            <div className="election-item" key={index}>
              <h2>{election.name}</h2>
              <p>
                {election.endDate > Math.floor(Date.now() / 1000)
                  ? `Remaining time: ${formatRemainingTime(election.remainingTime)}`
                  : 'Election has ended'}
              </p>
              <img
                src={getElectionImage(election.electionType)}
                alt={`Election ${index + 1}`}
                className="election-image"
              />
              {election.endDate > Math.floor(Date.now() / 1000) && (
                <Link to={`/candidates/${election.id}`} className="view-candidates-button">
                  View Candidates
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailsElection;
