import Sidebar from '../../src/js/sidebar/Sidebar';
import React from 'react';
import '../css/home.css'

const Home = () => {
  return (
    <div className="box">
      <Sidebar />
    <nav className="user-manual-nav">
      <h2>User Manual</h2>
    </nav>
    <div className="user-manual-container">
      <div className="info-box">
        <h3>Welcome</h3>
        <p>These are the guidelines for the user manual:</p>
        <ol>
          <li>
            <h4>Voter Registration</h4>
            <ul>
              <li>
                For casting your vote, you need to first register yourself. A voter registration form will be provided on this website for the registration process.
              </li>
              <li>
                You can only register during the registration phase. After the registration phase is over, you cannot register and thus will not be able to vote.
              </li>
              <li>
                To register, you need to enter your CNP card number and the account address you will be using for voting purposes.
              </li>
              <li>
                In the first stage, your age will be checked. If you are 18 years of age or above, you are eligible to vote.
              </li>
              <li>
                The second stage is OTP verification. This stage is required to validate your identity. After entering your CNP number and successfully verifying your age, you will receive an OTP.
              </li>
              <li>
                After entering the correct OTP, you will be successfully registered.
              </li>
            </ul>
          </li>
          <li>
            <h4>Voting Process</h4>
            <p>
              The voting process is divided into three phases, all of which will be initialized and terminated by the admin. You have to participate in the process according to the current phase.
            </p>
            <ol>
              <li>
                <strong>Registration Phase:</strong> During this phase, the registration of users who will cast their votes will be carried out.
              </li>
              <li>
                <strong>Voting Phase:</strong> After the admin initializes the voting phase, you can cast your vote in the voting section. To cast your vote, simply click the 'VOTE' button, which will initiate a transaction. After confirming the transaction, your vote will be successfully cast. After the voting phase ends, you will not be able to cast your vote.
              </li>
              <li>
                <strong>Result Phase:</strong> This is the final stage of the entire voting process, during which the election results will be displayed in the 'Results' section.
              </li>
            </ol>
          </li>
        </ol>
      </div>
    </div>
  </div>
    
  );
};

export default Home;
