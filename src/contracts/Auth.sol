/// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Auth {
    
    struct User {
        string username;
        string email;
        bytes32 password;
    }

    mapping (string => address) private usernameToAddress;
    mapping (string => address) private emailToAddress;
    mapping (address => User) private users;
    mapping (address => bool) private loggedIn;

    event AccountCreated(address indexed userAddress, string username, string email);
    event AccountLoggedIn(address indexed userAddress, string email);

    function createAccount(string memory username, string memory email, bytes32 password, bytes32 confirmPassword) public {
        require(password == confirmPassword, "Passwords do not match");
        require(usernameToAddress[username] == address(0), "Username already exists");
        require(emailToAddress[email] == address(0), "Email already exists");

        address userAddress = msg.sender;
        users[userAddress] = User(username, email, password);
        usernameToAddress[username] = userAddress;
        emailToAddress[email] = userAddress;

        emit AccountCreated(userAddress, username, email);
    }

    function login(string memory email, bytes32 password) public {
        require(emailToAddress[email] != address(0), "Email not found");
        address userAddress = emailToAddress[email];
        require(users[userAddress].password == password, "Invalid password");

        loggedIn[userAddress] = true;
        emit AccountLoggedIn(userAddress, email);
    }

    function logout() public {
        require(loggedIn[msg.sender], "Not logged in");

        loggedIn[msg.sender] = false;
    }
}
