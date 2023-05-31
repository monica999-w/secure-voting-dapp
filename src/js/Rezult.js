import React, { useState, useEffect } from 'react';
import { loadBlockchainData } from './../Web3helpers';
import Sidebar from './sidebar/Sidebar';
import '../css/rezult.css';
import Chart from 'chart.js/auto';

const Rezult = () => {
  const [votingSystem, setVotingSystem] = useState(null);
  const [elections, setElections] = useState([]);
  const [activeElections, setActiveElections] = useState([]);
  const [finishedElections, setFinishedElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [activeChart, setActiveChart] = useState(null);
  const [finishedChart, setFinishedChart] = useState(null);
  const [activeWinner, setActiveWinner] = useState(null);
  const [finishedWinner, setFinishedWinner] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { votingSystem } = await loadBlockchainData();
      setVotingSystem(votingSystem);
    };

    init();
  }, []);

  useEffect(() => {
    if (votingSystem) {
      fetchElections();
    }
  }, [votingSystem]);

  useEffect(() => {
    if (selectedElection) {
      updateChart();
    }
  }, [selectedElection]);

  useEffect(() => {
    if (finishedElections.length > 0) {
      displayWinner(finishedElections, true);
    }
  }, [finishedElections]);

  const fetchElections = async () => {
    const fetchedElections = await votingSystem.methods.getFinishedElections().call();
    const activeElections = await votingSystem.methods.getActiveElections().call();

    setElections([...activeElections, ...fetchedElections]);
    setActiveElections(activeElections);
    setFinishedElections(fetchedElections);
  };

  const handleSelectElection = (electionId) => {
    setSelectedElection(electionId);
  };

  const updateChart = async () => {
    const candidates = await votingSystem.methods.getCandidatesByElectionId(selectedElection).call();
    const candidateLabels = candidates.map((candidate) => candidate.fullName);
    const voteCounts = candidates.map((candidate) => candidate.voteCount);

    if (activeChart) {
      activeChart.data.labels = candidateLabels;
      activeChart.data.datasets[0].data = voteCounts;
      activeChart.update();
    } else {
      const ctx = document.getElementById('active-chart').getContext('2d');
      const newActiveChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: candidateLabels,
          datasets: [
            {
              label: 'Votes',
              data: voteCounts,
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              precision: 0,
            },
          },
        },
      });

      setActiveChart(newActiveChart);
    }
  };

  const displayWinner = async (elections, isFinished) => {
    let winnerCandidate = null;
    let highestVoteCount = 0;

    for (const election of elections) {
      const candidates = await votingSystem.methods.getCandidatesByElectionId(election.id).call();
      for (const candidate of candidates) {
        if (candidate.voteCount > highestVoteCount) {
          highestVoteCount = candidate.voteCount;
          winnerCandidate = candidate;
        }
      }
    }

    if (isFinished) {
      if (winnerCandidate) {
        setFinishedWinner(winnerCandidate.fullName);
      } else {
        setFinishedWinner(null);
      }
    } else {
      if (winnerCandidate) {
        setActiveWinner(winnerCandidate.fullName);
      } else {
        setActiveWinner(null);
      }
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content-container">
        <div className="active-elections-container">

        {selectedElection && (
          <div className="chart-container">
            <canvas id="active-chart"></canvas>
          </div>
        )}
        {selectedElection && finishedElections.length > 0 && (
          <div className="finished-chart-container">
            <canvas id="finished-chart"></canvas>
          </div>
        )}
        
          <h3 className="elections-title">Active Elections</h3>
          <div className="elections-list">
            {activeElections.length > 0 ? (
              activeElections.map((election) => (
                <div
                  className={`election-item ${selectedElection === election.id ? 'selected' : ''}`}
                  key={election.id}
                  onClick={() => handleSelectElection(election.id)}
                >
                  <h4 className="election-name">{election.name}</h4>
                  {activeWinner && selectedElection === election.id && (
                    <p className="winner-name">{activeWinner} (Winner)</p>
                  )}
                </div>
              ))
            ) : (
              <p>No active elections available</p>
            )}
          </div>
        </div>

        {finishedElections.length > 0 && (
          <div className="finished-elections-container">
            <h3 className="elections-title">Finished Elections</h3>
            <div className="elections-list">
              {finishedElections.map((election) => (
                <div
                  className={`election-item ${selectedElection === election.id ? 'selected' : ''}`}
                  key={election.id}
                  onClick={() => handleSelectElection(election.id)}
                >
                  <h4 className="election-name">{election.name}</h4>
                  {finishedWinner && selectedElection === election.id && (
                    <p className="winner-name">{finishedWinner} (Winner)</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default Rezult;

