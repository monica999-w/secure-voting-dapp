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
        uint electionId;
        uint voteCount; // Adăugăm un câmp pentru numărul de voturi primite
    }

    struct Election {
        uint id;
        string name;
        ElectionType electionType;
        string organizedBy;
        uint startDate;
        uint endDate;
        bool ended; // Adăugăm un câmp pentru a verifica dacă alegerile s-au încheiat
    }

    Election[] public elections;
    Candidate[] public candidates;
    event CandidateEdited(uint candidateId, string fullName, uint age, string description, string image);
    event CandidateDeleted(uint candidateId);
    mapping(uint => bool) public candidateExists;
    mapping(address => mapping(uint => bool)) public hasVoted; // Mapare pentru a verifica dacă un utilizator a votat într-o anumită aleger

    event NewElection(
        uint id,
        string name,
        ElectionType electionType,
        string organizedBy,
        uint startDate,
        uint endDate
    );

    event NewCandidate(
        uint candidateId,
        string fullName,
        uint age,
        string description,
        string image,
        uint electionId
    );

    event Vote(uint electionId, uint candidateId, address voter);

    function addElection(
        string memory _name,
        ElectionType _electionType,
        string memory _organizedBy,
        uint _startDate,
        uint _endDate
    ) public {
        require(
            !electionExists(_name, _startDate, _endDate),
            "Election with the same name or overlapping time period already exists."
        );

        uint electionId = elections.length;
        elections.push(
            Election(electionId, _name, _electionType, _organizedBy, _startDate, _endDate, false)
        );

        emit NewElection(electionId, _name, _electionType, _organizedBy, _startDate, _endDate);
    }

    function addCandidate(
        string memory _fullName,
        uint _age,
        string memory _description,
        string memory _image,
        uint _electionId
    ) public {
        require(
            elections.length > 0,
            "No elections available. Please create an election first."
        );

        require(
            !electionEnded(_electionId),
            "Election has ended. No more candidates can be added."
        );

        require(
            !candidateExists[candidates.length],
            "Candidate already exists."
        );

        candidates.push(
            Candidate(
                candidates.length,
                _fullName,
                _age,
                _description,
                _image,
                _electionId,
                0
            )
        );
        candidateExists[candidates.length - 1] = true;

        emit NewCandidate(
            candidates.length - 1,
            _fullName,
            _age,
            _description,
            _image,
            _electionId
        );
    }

    function vote(uint _electionId, uint _candidateId) public {
        require(_electionId < elections.length, "Election does not exist.");
        require(_candidateId < candidates.length, "Candidate does not exist.");
        require(!hasVoted[msg.sender][_electionId], "You have already voted in this election.");

        Election storage election = elections[_electionId];
        require(!election.ended, "Election has ended. No more votes can be cast.");

        Candidate storage candidate = candidates[_candidateId];
        require(candidate.electionId == _electionId, "Candidate does not belong to the specified election.");

        candidate.voteCount++; // Incrementăm numărul de voturi primite de către candidat
        hasVoted[msg.sender][_electionId] = true; // Marchez că utilizatorul a votat în această aleger

        emit Vote(_electionId, _candidateId, msg.sender);
    }

    function getCandidateDetails(uint _candidateId)
        public
        view
        returns (
            string memory,
            uint,
            string memory,
            string memory,
            uint,
            uint
        )
    {
        require(candidateExists[_candidateId], "Candidate does not exist.");
        Candidate memory candidate = candidates[_candidateId];
        return (
            candidate.fullName,
            candidate.age,
            candidate.description,
            candidate.image,
            candidate.electionId,
            candidate.voteCount
        );
    }

    function getElectionDetails(uint _electionId)
        public
        view
        returns (
            uint,
            string memory,
            ElectionType,
            string memory,
            uint,
            uint,
            bool
        )
    {
        require(_electionId < elections.length, "Election does not exist.");
        Election memory election = elections[_electionId];
        return (
            election.id,
            election.name,
            election.electionType,
            election.organizedBy,
            election.startDate,
            election.endDate,
            election.ended
        );
    }

    function getElectionCount() public view returns (uint) {
        return elections.length;
    }

    function getCandidateCount() public view returns (uint) {
        return candidates.length;
    }

    function electionEnded(uint _electionId) public view returns (bool) {
        require(_electionId < elections.length, "Election does not exist.");
        Election storage election = elections[_electionId];
        return election.ended;
    }

    function getActiveElections() public view returns (Election[] memory) {
        uint activeElectionCount = 0;
        for (uint i = 0; i < elections.length; i++) {
            if (block.timestamp >= elections[i].startDate && block.timestamp <= elections[i].endDate) {
                activeElectionCount++;
            }
        }
        Election[] memory activeElections = new Election[](activeElectionCount);
        uint currentIndex = 0;
        for (uint i = 0; i < elections.length; i++) {
            if (block.timestamp >= elections[i].startDate && block.timestamp <= elections[i].endDate) {
                activeElections[currentIndex] = elections[i];
                currentIndex++;
            }
        }
        return activeElections;
    }

    function getCandidatesByElectionId(uint _electionId) public view returns (Candidate[] memory) {
        require(_electionId < elections.length, "Election does not exist.");

        uint candidateCount = 0;

        // Count the candidates belonging to the election
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].electionId == _electionId) {
                candidateCount++;
            }
        }

        Candidate[] memory electionCandidates = new Candidate[](candidateCount);
        uint currentIndex = 0;

        // Get the candidates belonging to the election
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].electionId == _electionId) {
                electionCandidates[currentIndex] = candidates[i];
                currentIndex++;
            }
        }

        return electionCandidates;
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
                ((_startDate >= existingElection.startDate && _startDate <= existingElection.endDate) ||
                    (_endDate >= existingElection.startDate && _endDate <= existingElection.endDate))
            ) {
                return true;
            }
        }
        return false;
    }

    function editCandidate(
        uint _candidateId,
        string memory _fullName,
        uint _age,
        string memory _description,
        string memory _image
    ) public {
        require(candidateExists[_candidateId], "Candidate does not exist.");

        Candidate storage candidate = candidates[_candidateId];
        candidate.fullName = _fullName;
        candidate.age = _age;
        candidate.description = _description;
        candidate.image = _image;

        emit CandidateEdited(_candidateId, _fullName, _age, _description, _image);
    }

    function deleteCandidate(uint candidateId) public {
  require(candidateId < candidates.length, "Candidate does not exist.");

  // Remove the candidate from the array
  for (uint i = candidateId; i < candidates.length - 1; i++) {
    candidates[i] = candidates[i + 1];
  }
  candidates.pop();

  // Update the candidateExists mapping
  candidateExists[candidateId] = false;
}

function getFinishedElections() public view returns (Election[] memory) {
    uint finishedElectionCount = 0;
    for (uint i = 0; i < elections.length; i++) {
        if (block.timestamp > elections[i].endDate) {
            finishedElectionCount++;
        }
    }
    Election[] memory finishedElections = new Election[](finishedElectionCount);
    uint currentIndex = 0;
    for (uint i = 0; i < elections.length; i++) {
        if (block.timestamp > elections[i].endDate) {
            finishedElections[currentIndex] = elections[i];
            currentIndex++;
        }
    }
    return finishedElections;
}


}


