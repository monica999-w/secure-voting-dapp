// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {

    enum ElectionType { Political, Corporation, Academics }
    
    struct Candidate {
        uint id;
        string fullName;
        uint age;
        string description;
        string image;
    }

    struct Election {
        string name;
        ElectionType electionType;
        string organizedBy;
        uint startDate;
        uint endDate;
    }

    Election[] public elections;
    Candidate[] public candidates;
    mapping(uint => bool) public candidateExists;

    event NewElection(string name, ElectionType electionType, string organizedBy, uint startDate, uint endDate );
    event NewCandidate(uint candidateId, string fullName, uint age, string description, string image);

    function addElection(
        string memory _name,
        ElectionType _electionType,
        string memory _organizedBy,
        uint _startDate,
        uint _endDate
    ) public {
        require(!electionExists(_name, _startDate, _endDate), "Election with the same name or overlapping time period already exists.");

        elections.push(Election(_name, _electionType, _organizedBy, _startDate, _endDate));

        emit NewElection(_name, _electionType, _organizedBy, _startDate, _endDate);
    }

    function addCandidate(
        string memory _fullName,
        uint _age,
        string memory _description,
        string memory _image
    ) public {
        require(elections.length > 0, "No elections available. Please create an election first.");
        require(!electionEnded(), "Election has ended. No more candidates can be added.");
        require(!candidateExists[candidates.length], "Candidate already exists.");

        candidates.push(Candidate(candidates.length, _fullName, _age, _description, _image));
        candidateExists[candidates.length - 1] = true;

        emit NewCandidate(candidates.length - 1, _fullName, _age, _description, _image);
    }

    function getCandidateDetails(uint _candidateId) public view returns (
        string memory,
        uint,
        string memory,
        string memory
    ) {
        require(candidateExists[_candidateId], "Candidate does not exist.");
        Candidate memory candidate = candidates[_candidateId];
        return (
            candidate.fullName,
            candidate.age,
            candidate.description,
            candidate.image
        );
    }

    function getElectionDetails(uint _electionId) public view returns (
    string memory,
    ElectionType,
    string memory,
    uint,
    uint
      ) {
    require(_electionId < elections.length, "Election does not exist.");
    Election memory election = elections[_electionId];
    return (
        election.name,
        election.electionType,
        election.organizedBy,
        election.startDate,
        election.endDate
    );
    }

    function getElectionCount() public view returns (uint) {
    return elections.length;
    }

    function electionEnded() public view returns (bool) {
        if (elections.length == 0) {
            return false;
        }
        Election storage currentElection = elections[elections.length - 1];
        return block.timestamp > currentElection.endDate;
    }


   function electionExists(
    string memory _name,
    uint _startDate,
    uint _endDate
    ) internal view returns (bool) {
    for (uint i = 0; i < elections.length; i++) {
        Election storage existingElection = elections[i];
        if (
            keccak256(abi.encodePacked(existingElection.name)) == keccak256(abi.encodePacked(_name)) &&
            (
                (_startDate >= existingElection.startDate && _startDate <= existingElection.endDate) ||
                (_endDate >= existingElection.startDate && _endDate <= existingElection.endDate)
            )
        ) {
            return true;
        }
    }
    return false;
  }
 

}
