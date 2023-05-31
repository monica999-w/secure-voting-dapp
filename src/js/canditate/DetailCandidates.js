import React, { useState, useEffect } from 'react';
import { loadBlockchainData } from '../../Web3helpers';
import Sidebar from '../sidebar/Sidebar';
import '../../css/detailCandidates.css';

const DetailCandidates = () => {
  const [votingSystem, setVotingSystem] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [accounts, setAccounts] = useState('');
  const [editDeleteVisible, setEditDeleteVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { votingSystem, accounts } = await loadBlockchainData();
      setVotingSystem(votingSystem);
      setAccounts(accounts);
    };


    init();
  }, []);

  useEffect(() => {
    if (votingSystem) {
      fetchCandidates(); // Actualizează lista de candidați
    }
  }, [votingSystem]);

  useEffect(() => {
    if (selectedCandidate !== null) {
      fetchCandidates(); // Actualizează lista de candidați după editare/ștergere
    }
  }, [selectedCandidate]);

  const fetchCandidates = async () => {
    const candidateCount = await votingSystem.methods.getCandidateCount().call();
    const fetchedCandidates = [];
    const fetchedElections = [];

    for (let i = 0; i < candidateCount; i++) {
      const candidateDetails = await votingSystem.methods.getCandidateDetails(i).call();
      const electionId = parseInt(candidateDetails[4]);
      const voteCount = parseInt(candidateDetails[5]);

      const formattedCandidateDetails = {
        id: i,
        fullName: candidateDetails[0],
        age: parseInt(candidateDetails[1]),
        description: candidateDetails[2],
        image: candidateDetails[3],
        electionId: electionId,
        voteCount: voteCount,
      };

      fetchedCandidates.push(formattedCandidateDetails);

      const electionDetails = await votingSystem.methods.getElectionDetails(electionId).call();
      const electionName = electionDetails[1];

      fetchedElections.push({ id: electionId, name: electionName });
    }

    setCandidates(fetchedCandidates);
    setElections(fetchedElections);
  };

  const handleEditCandidate = (candidateId) => {
    setEditDeleteVisible(!editDeleteVisible);
    setSelectedCandidate(candidateId);
  };

  const handleDeleteCandidate = (candidateId) => {
    setEditDeleteVisible(!editDeleteVisible);
    setSelectedCandidate(candidateId);
  };

  const handleConfirmEdit = async (candidateId, fullName, age, description, image) => {
    try {
      await votingSystem.methods.editCandidate(candidateId, fullName, age, description, image).send({ from: accounts });
      alert('Candidate edited successfully!');
      setEditDeleteVisible(false);
      setSelectedCandidate(null);
      fetchCandidates(); // Actualizează lista de candidați
    } catch (error) {
      console.error(error);
      alert('Failed to edit candidate.');
    }
  };

  const handleConfirmDelete = async (candidateId) => {
    try {
      await votingSystem.methods.deleteCandidate(candidateId).send({ from: accounts });
      alert('Candidate deleted successfully!');
      setEditDeleteVisible(false);
      setSelectedCandidate(null);
      setCandidates(candidates.filter((candidate) => candidate.id !== candidateId));
      fetchCandidates();
    } catch (error) {
      console.error(error);
      alert('Failed to delete candidate.');
    }
  };

  const getElectionName = (electionId) => {
    const election = elections.find((e) => e.id === electionId);
    return election ? election.name : '';
  };

  const truncateDescription = (description) => {
    if (description.length <= 10) {
      return description;
    } else {
      const truncatedDescription = description.slice(0, 6) + '...' + description.slice(-4);
      return truncatedDescription;
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content-container">
        <nav className="navbar">
          <h2 className="navbar-title">Candidate Details</h2>
        </nav>

        <div className="candidates-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Candidate</th>
                <th>Age</th>
                <th>Description</th>
                <th>Election</th>
                <th>Votes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length > 0 ? (
                candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td>{candidate.id}</td>
                    <td>{candidate.fullName}</td>
                    <td>{candidate.age}</td>
                    <td>{truncateDescription(candidate.description)}</td>
                    <td>{getElectionName(candidate.electionId)}</td>
                    <td>{candidate.voteCount}</td>
                    <td>
                      <div className="edit-delete-container">
                        {editDeleteVisible && selectedCandidate === candidate.id && (
                          <div className="edit-delete-actions">
                            <button
                              className="confirm-edit-button"
                              onClick={() =>
                                handleConfirmEdit(
                                  candidate.id,
                                  prompt('Enter new full name:', candidate.fullName),
                                  parseInt(prompt('Enter new age:', candidate.age)),
                                  prompt('Enter new description:', candidate.description),
                                  prompt('Enter new image URL:', candidate.image)
                                )
                              }
                            >
                              Confirm Edit
                            </button>
                            <button
                              className="confirm-delete-button"
                              onClick={() => handleConfirmDelete(candidate.id)}
                            >
                              Confirm Delete
                            </button>
                          </div>
                        )}
                        <button className="edit-button" onClick={() => handleEditCandidate(candidate.id)}>
                          Edit
                        </button>
                        <button className="delete-button" onClick={() => handleDeleteCandidate(candidate.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No candidates available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DetailCandidates;
