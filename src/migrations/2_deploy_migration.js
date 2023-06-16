const Auth = artifacts.require("Auth");
const VotingSystem = artifacts.require("VotingSystem");
const VoterRegistration = artifacts.require("VoterRegistration");

module.exports = async function (deployer) {
  await deployer.deploy(Auth);
  await deployer.deploy(VotingSystem);
  const authContract = await Auth.deployed();
  await deployer.deploy(VoterRegistration, authContract.address);
};
