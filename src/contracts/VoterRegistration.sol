// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Auth.sol";

contract VoterRegistration {
    Auth private authContract;
    mapping(address => string) private metamaskToEmail;
    mapping(string => uint) private emailToCNP;
    mapping(uint => address) private cnpToAddress;
    mapping(address => bool) private metamaskVerified;

    constructor(Auth _authContract) {
        authContract = _authContract;
    }

    function verifyMetaMaskAddress(address metamaskAddress, uint cnp) public {
        require(authContract.isMetaMaskRegistered(metamaskAddress), "MetaMask address not registered");
        string memory userEmail = authContract.getUserEmail(metamaskAddress);
        
        require(emailToCNP[userEmail] == 0, "CNP already associated with email");
        require(cnpToAddress[cnp] == address(0), "CNP already associated with another MetaMask address");

        metamaskToEmail[metamaskAddress] = userEmail;
        emailToCNP[userEmail] = cnp;
        cnpToAddress[cnp] = metamaskAddress;
    }

    function getEmailByMetaMaskAddress(address metamaskAddress) public view returns (string memory) {
        return metamaskToEmail[metamaskAddress];
    }

    function getCNPByEmail(string memory userEmail) public view returns (uint) {
        return emailToCNP[userEmail];
    }

    function getMetaMaskAddressByCNP(uint cnp) public view returns (address) {
        return cnpToAddress[cnp];
    }

    function setMetamaskVerified(address metamaskAddress, bool verified) public {
        metamaskVerified[metamaskAddress] = verified;
    }

    function isMetamaskVerified(address metamaskAddress) public view returns (bool) {
        return metamaskVerified[metamaskAddress];
    }

     function isAddressVerified(address metamaskAddress) public view returns (bool) {
    string memory userEmail = metamaskToEmail[metamaskAddress];
    return emailToCNP[userEmail] != 0;
}


}

