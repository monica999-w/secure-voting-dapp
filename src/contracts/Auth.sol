// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Auth {
    struct User {
        string username;
        string email;
        bytes32 password;
        bool isAdmin;
    }

    mapping (address => User) private users;
    mapping (string => address) private usernameToAddress;
    mapping (string => address) private emailToAddress;
    mapping (address => bool) private loggedIn;
    mapping (address => bool) private metamaskRegistered;
    mapping (address => string) private metamaskToEmail; // New mapping to store MetaMask address to email
    string[] private allEmails; // New array to store all email addresses

    event AccountCreated(address indexed userAddress, string username, string email, bool isAdmin);
    event AccountLoggedIn(address indexed userAddress, string email);

    function createAccount(string memory username, string memory email, bytes32 password, bytes32 confirmPassword) public {
        require(password == confirmPassword, "Passwords do not match");
        require(usernameToAddress[username] == address(0), "Username already exists");
        require(emailToAddress[email] == address(0), "Email already exists");
        require(!metamaskRegistered[msg.sender], "MetaMask address already registered");

        address userAddress = msg.sender;
        bool isAdmin = isAdminUser(username, email, password);
        users[userAddress] = User(username, email, password, isAdmin);
        usernameToAddress[username] = userAddress;
        emailToAddress[email] = userAddress;
        loggedIn[userAddress] = true;
        metamaskRegistered[userAddress] = true;
        metamaskToEmail[userAddress] = email; // Store the email associated with MetaMask address
        allEmails.push(email);

        emit AccountCreated(userAddress, username, email, isAdmin);
        emit AccountLoggedIn(userAddress, email);
    }

    function login(string memory email, bytes32 password) public {
        require(emailToAddress[email] != address(0), "Email not found");
        address userAddress = emailToAddress[email];
        require(users[userAddress].password == password, "Invalid password");
        require(userAddress == msg.sender, "Invalid MetaMask address");
        loggedIn[userAddress] = true;
        emit AccountLoggedIn(userAddress, email);
    }

    function logout() public {
        require(loggedIn[msg.sender], "Not logged in");
        loggedIn[msg.sender] = false;
    }

    function getUserRole(address userAddress) public view returns (bool) {
        return users[userAddress].isAdmin;
    }

    function isAdminUser(string memory username, string memory email, bytes32 password) private pure returns (bool) {
        // Check if the specified user should be an admin
        if (
            keccak256(abi.encodePacked(username)) == keccak256(abi.encodePacked("admin")) &&
            keccak256(abi.encodePacked(email)) == keccak256(abi.encodePacked("admin@blockchain.com")) &&
            password == bytes32(uint256(keccak256(abi.encodePacked("admin"))))
        ) {
            return true;
        } else {
            return false;
        }
    }

    function isMetaMaskRegistered(address metamaskAddress) public view returns (bool) {
        return metamaskRegistered[metamaskAddress];
    }

    function getUserEmail(address userAddress) public view returns (string memory) {
        return metamaskToEmail[userAddress];
    }

     function getAllUserEmails() public view returns (string[] memory) {
        return allEmails;
    }

    function getMetaMaskAddressByEmail(string memory userEmail) public view returns (address) {
         return emailToAddress[userEmail];
}
    function getUsernameByEmail(string memory email) public view returns (string memory) {
        address userAddress = emailToAddress[email];
        return users[userAddress].username;
    }

}
