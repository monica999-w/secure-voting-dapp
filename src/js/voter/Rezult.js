import React, { useState, useEffect } from 'react';
import { loadBlockchainData } from '../../Web3helpers';
import Sidebar from '../sidebar/Sidebar';
import '../../css/rezult.css';
import Chart from 'chart.js/auto';
import countyMap from './counties';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import geoUrl from '../../counties.json'
import Legend from './Legend';




const Rezult = () => {
  const [votingSystem, setVotingSystem] = useState(null);
  const [voterRegistration, setVoterRegistration] = useState(null);
  const [elections, setElections] = useState([]);
  const [activeElections, setActiveElections] = useState([]);
  const [finishedElections, setFinishedElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [activeCharts, setActiveCharts] = useState({});
  const [finishedCharts, setFinishedCharts] = useState({});
  const [activeWinners, setActiveWinners] = useState({});
  const [finishedWinners, setFinishedWinners] = useState({});
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [ageCounts, setAgeCounts] = useState({});
  const [countyPercentages, setCountyPercentages] = useState({});
 // const geoUrl = 'https://raw.githubusercontent.com/civicnet/geojson-romania/master/generated/counties.json';
 const [chartInstance, setChartInstance] = useState(null);


  useEffect(() => {
    const init = async () => {
      const { votingSystem, voterRegistration } = await loadBlockchainData();
      setVotingSystem(votingSystem);
      setVoterRegistration(voterRegistration);
    };

    init();
  }, []);

  useEffect(() => {
    if (votingSystem) {
      fetchElections();
    }
  }, [votingSystem]);

  useEffect(() => {
    if (activeElections.length > 0) {
      setSelectedElection(activeElections[0].id);
    }
  }, [activeElections]);

  useEffect(() => {
    if (selectedElection) {
      updateCharts();
    }
  }, [selectedElection]);

  useEffect(() => {
    if (activeElections.length > 0) {
      updateCharts();
    }
  }, [activeElections]);

  useEffect(() => {
    if (finishedElections.length > 0) {
      updateCharts();
    }
  }, [finishedElections]);

  useEffect(() => {
    const visibilityTimeout = setTimeout(() => {
      setFinishedElections([]);
      setFinishedCharts({});
      setFinishedWinners({});
    }, 4 * 60 * 60 * 1000); // 4 hours in milliseconds

    return () => clearTimeout(visibilityTimeout);
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

  const updateCharts = async () => {


    for (const election of activeElections) {
      const candidates = await votingSystem.methods.getCandidatesByElectionId(election.id).call();
      const candidateLabels = candidates.map((candidate) => candidate.fullName);
      const voteCounts = candidates.map((candidate) => candidate.voteCount);

      const totalVotes = voteCounts.reduce((sum, count) => sum + parseInt(count), 0);
      const percentages = voteCounts.map((count) => ((parseInt(count) / totalVotes) * 100).toFixed(2));
      
      if (!activeCharts[election.id]) {
        const activeChartCanvas = document.getElementById(`active-chart-${election.id}`);
        const ctz = activeChartCanvas.getContext('2d');
        const newActiveChart = new Chart(ctz, {
          type: 'doughnut',
          data: {
            labels: candidateLabels,
            datasets: [
              {
                data: percentages,
                backgroundColor: [
                  '#36A2EB',
                  '#FFCE56',
                  '#4BC0C0',
                  '#9966FF',
                  '#FF9F40',
                  '#FF6384',
                  '#36A2EB',
                ],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'left',
                
                labels: {
                  generateLabels: (chart) => {
                    const { data } = chart;
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label, index) => {
                        const dataset = data.datasets[0];
                        const percentage = data.datasets[0].data[index];
                        const formattedPercentage = `${percentage} %`;
                        const backgroundColor = dataset.backgroundColor[index];
                        return {
                          text: `${label} - ${formattedPercentage}`,
                          fillStyle: backgroundColor,
                          hidden: chart.getDatasetMeta(0).data[index].hidden,
                          index,
                        };
                      });
                    }
                    return [];
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || '';
                    const value = context.formattedValue || '';
                    return `${label} - ${value}%`;
                  },
                },
              },
            },
          },
          
        });
        

        setActiveCharts((prevState) => ({
          ...prevState,
          [election.id]: newActiveChart,
        }));
      }
    }

    for (const election of finishedElections) {
      const candidates = await votingSystem.methods.getCandidatesByElectionId(election.id).call();
      const candidateLabels = candidates.map((candidate) => candidate.fullName);
      const voteCounts = candidates.map((candidate) => candidate.voteCount);

      const totalVotes = voteCounts.reduce((sum, count) => sum + parseInt(count), 0);
      const percentages = voteCounts.map((count) => ((parseInt(count) / totalVotes) * 100).toFixed(2));

      if (!finishedCharts[election.id]) {
        const finishedChartCanvas = document.getElementById(`finished-chart-${election.id}`);
        const ctx = finishedChartCanvas.getContext('2d');
        const newFinishedChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: candidateLabels ,
            datasets: [
              {
                data: percentages,
                backgroundColor: [
                  '#36A2EB',
                  '#FFCE56',
                  '#4BC0C0',
                  '#9966FF',
                  '#FF9F40',
                  '#FF6384',
                  '#36A2EB',
                ],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'left',
                
                labels: {
                  generateLabels: (chart) => {
                    const { data } = chart;
                    if (data.labels.length && data.datasets.length) {
                      return data.labels.map((label, index) => {
                        const dataset = data.datasets[0];
                        const percentage = data.datasets[0].data[index];
                        const formattedPercentage = `${percentage} %`;
                        const backgroundColor = dataset.backgroundColor[index];
                        return {
                          text: `${label} - ${formattedPercentage}`,
                          fillStyle: backgroundColor,
                          hidden: chart.getDatasetMeta(0).data[index].hidden,
                          index,
                        };
                      });
                    }
                    return [];
                  },
                },
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || '';
                    const value = context.formattedValue || '';
                    return `${label} - ${value}%`;
                  },
                },
              },
            },
          },
          
        });

        setFinishedCharts((prevState) => ({
          ...prevState,
          [election.id]: newFinishedChart,
        }));
      }
    }
  };


  const calculateGenderCounts = async () => {
    if (!voterRegistration) return;

    const allCNPs = await voterRegistration.methods.getAllCNPs().call();
    let maleCount = 0;
    let femaleCount = 0;
    const totalCount = allCNPs.length;

    for (const cnp of allCNPs) {
      const genderDigit = parseInt(cnp.charAt(0));
      if (genderDigit % 2 === 0) {
        femaleCount++;
      } else {
        maleCount++;
      }
    }

    const malePercentage = ((maleCount / totalCount) * 100).toFixed(2);
    const femalePercentage = ((femaleCount / totalCount) * 100).toFixed(2);

    setMaleCount(malePercentage);
    setFemaleCount(femalePercentage);
  };

  const calculateAgeCounts = async () => {
    if (!voterRegistration) return;

    const allCNPs = await voterRegistration.methods.getAllCNPs().call();
    const ageCounts = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-64': 0,
      '65+': 0,
    };
    const totalCount = allCNPs.length;

    for (const cnp of allCNPs) {
      const birthDate = extractBirthDate(cnp);
      const age = calculateAge(birthDate);

      if (age >= 18 && age <= 24) {
        ageCounts['18-24']++;
      } else if (age >= 25 && age <= 34) {
        ageCounts['25-34']++;
      } else if (age >= 35 && age <= 44) {
        ageCounts['35-44']++;
      } else if (age >= 45 && age <= 64) {
        ageCounts['45-64']++;
      } else if (age >= 65) {
        ageCounts['65+']++;
      }
    }

    const agePercentages = {};
    for (const category in ageCounts) {
      const percentage = ((ageCounts[category] / totalCount) * 100).toFixed(2);
      agePercentages[category] = percentage;
    }

    setAgeCounts(agePercentages);

    if (chartInstance) {
      chartInstance.destroy();
    }
   
    const ctx = document.getElementById('ageChart').getContext('2d');
    const newChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(ageCounts),
          datasets: [
            {
              label: 'Age Distribution',
              data: Object.values(agePercentages),
              backgroundColor: 'rgba(0, 123, 255, 0.5)',
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Percentage',
              },
            },
            x: {
              title: {
                display: true,
                text: 'Age Range',
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  let label = context.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y + '%';
                  }
                  return label;
                },
              },
            },
          },
        },
        
      });
      newChartInstance.update();
      setChartInstance(newChartInstance);
  };
   

  const extractBirthDate = (cnp) => {
    let year = parseInt(cnp.substring(1, 3));
    const month = parseInt(cnp.substring(3, 5));
    const day = parseInt(cnp.substring(5, 7));
    const century = parseInt(cnp.charAt(0));
  
    if (century === 1 || century === 2) {
      year += 1900;
    } else if (century === 3 || century === 4) {
      year += 1800;
    } else if (century === 5 || century === 6) {
      year += 2000;
    }
  
    return new Date(year, month - 1, day);
  };
  
  const calculateAge = (birthDate) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  
    const calculateCountyPercentages = async () => {
      if (!voterRegistration) return;

      const allCNPs = await voterRegistration.methods.getAllCNPs().call();
      const countyCounts = {};
      const totalCNPs = allCNPs.length;

      
      for (const cnp of allCNPs) {
        const countyCode = parseInt(cnp.substring(7, 9));
        const countyName = countyMap[countyCode];

        if (countyName) {
          if (countyCounts[countyName]) {
            countyCounts[countyName]++;
          } else {
            countyCounts[countyName] = 1;
          }
        }
      }

      
      const countyPercentages = {};
      for (const county in countyCounts) {
        const count = countyCounts[county];
        const percentage = ((count / totalCNPs) * 100).toFixed(2);
        countyPercentages[county] = percentage;
      }

      setCountyPercentages(countyPercentages);
    };

    const getColorByPercentage = (percentage) => {
      if (percentage >= 70) {
        return '#FF0000'; // Red
      } else if (percentage >= 40) {
        return '#FFA500'; // Orange
      } else if (percentage >= 15) {
        return '#00FF00'; // Green
      } else {
        return '#00FF00'; // White
      }
    };

    

  useEffect(() => {
    if (voterRegistration) {
      calculateGenderCounts();
      calculateAgeCounts();
      calculateCountyPercentages();
    }
  }, [voterRegistration]);

  

  return (
    <div className="page">
      <Sidebar />
      <div className="content-container">
  {activeElections.length > 0 && (
    <div className="active-elections-container">
      <h3 className="elections-title">Active Elections</h3>
      <div className="elections-list">
        {activeElections.map((election) => (
          <div className="election-item" key={election.id}>
            <table className="result-table">
              <tbody>
                <tr>
                  <td>{election.name}</td>
                </tr>
                <tr>
                  <td>
                  <p>Welcome ! Here you can track the progress of our election and see how the candidates are performing. Below, you will find a legend of the candidates and the percentage of votes they have received so far:</p>
                    {activeWinners[election.id] && selectedElection === election.id && (
                      <p className="winner-name">{activeWinners[election.id]} (Winner)</p>
                    )}
                    <div className="chart-container">
                      <canvas id={`active-chart-${election.id}`}></canvas>
                    </div>
                    <p>These percentages reflect the number of votes each candidate has received in relation to the total votes cast up to this point. The final results will be announced in the 'Finish Election' section after the voting is concluded.</p>
                    <p>We invite you to monitor this section for the latest updates on the election and to express your preferences through your vote. </p>
                    <p class="every-vote-counts">Every vote counts!</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )}

  
{finishedElections.length > 0 && (
  <div className="finished-elections-container">
    <h3 className="elections-title">Finished Elections</h3>
    <div className="elections-list">
      {finishedElections.map((election) => (
        <div className={`election-item ${selectedElection === election.id ? 'selected' : ''}`} key={election.id}>
          <table className="result-table">
            <tbody>
              <tr>
                <td>{election.name}</td>
              </tr>
              <tr>
                <td>
                  <p>Thank you for participating in our elections! Voting has now closed, and we are pleased to announce the final results. The final results will be displayed below, showing the candidates and the relevant percentages of the number of votes:</p>
                  {finishedWinners[election.id] && selectedElection === election.id && (
                    <p className="winner-name">{finishedWinners[election.id]} (Winner)</p>
                  )}
                  <div className="chart-container">
                    <canvas id={`finished-chart-${election.id}`}></canvas>
                  </div>
                  <p>We would like to express our gratitude to all the candidates and voters who contributed to this democratic process. Your participation is essential in shaping our community.</p>
                
          <div className="age-text">
            <h3>Average Age at the Polls</h3>
            <p>The average age of individuals who participated in the election is a key indicator of civic engagement across different age groups. It provides valuable insights into the level of political awareness and involvement among the population.</p>
            <p>By analyzing the voter registration records, it is evident that voters from diverse age ranges exercised their right to vote. This diversity in age groups demonstrates the significance of democratic participation and the importance of diverse perspectives in shaping the outcomes of elections.</p>
            <div className="canvas-age">
              <canvas id="ageChart"></canvas>
            </div>
            <div className="age-counts">
              <ul>
                <li>18-24: {ageCounts['18-24']}%</li>
                <li>25-34: {ageCounts['25-34']}%</li>
                <li>35-44: {ageCounts['35-44']}%</li>
                <li>45-64: {ageCounts['45-64']}%</li>
                <li>65+: {ageCounts['65+']}%</li>
              </ul>
            </div>
            <p>The average age at the polls serves as a reflection of the collective voice of our community, representing the values and aspirations of people from different generations. We appreciate the active involvement of voters of all ages and their contribution to shaping the future of our society through their votes.</p>
          </div>
          <div className="age-text">
            <h3>Voter Turnout by County</h3>
            <p>The voter turnout by county provides an overview of the participation rate in each region during the election. It shows the percentage of registered voters who exercised their right to vote in each county.</p>
            <p>By analyzing the data, we can observe the level of civic engagement and the enthusiasm for democratic processes across different regions. It reflects the commitment of the citizens to shape the future of our country through their votes.</p>
          </div>
          <div className="county-map-container" style={{ width: '100%', height: '600px' }}>
            <Legend />
            <ComposableMap projection="geoMercator" width={600} height={400} projectionConfig={{ scale: 2000, center: [26, 45] }}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countyName = geo.properties.name;
                    const percentage = countyPercentages[countyName] || 0;
                    const color = getColorByPercentage(percentage);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={color}
                        stroke="#000000"
                        strokeWidth={0.5}
                      />
                    );
                  })
                }
              </Geographies>
              
            </ComposableMap>
          </div>
          </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>
  </div>
)}
</div>
</div>
  )
};

export default Rezult;
