import {React, useState, useEffect, useRef} from 'react';
import { Header } from './header.js';
import Chart from 'chart.js/auto';

import stylesDetails from '../styles/Details.module.css';


function Detail({ companyData }) {
  const [selectedChart, setSelectedChart] = useState("consumption");
  const graphRefs = useRef([]);
  const chartInstances = useRef([]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);

    const company = queryParams.get('company');
    document.getElementById('companyname').textContent = company;

    const destroyChartInstances = () => {
      chartInstances.current.forEach((chart) => {
        chart.destroy();
      });
      chartInstances.current = [];
    };

    destroyChartInstances();
    const consumptionString = queryParams.get('consumption');
    const consumption = consumptionString.split(',').map(Number);

    console.log("consumption " + consumption);

    const greenString = queryParams.get('green');
    const green = greenString.split(',').map(Number);

    console.log("green " + green);

    const sharingString = queryParams.get('sharing');
    const sharing = sharingString.split(',').map(Number);

    console.log("sharing " + sharing);

    const generateChart = (chartData) => {
      graphRefs.current.forEach((ref, index) => {
        const ctx = ref.getContext('2d');
        if (ctx) {
          const step = Math.ceil(chartData.length / 5);
    
          const chart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: chartData.map((_, i) => (i % step === 0 ? (i + 1).toString() : '')),
              datasets: [
                {
                  data: chartData,
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(250, 0, 0, 1)',
                  borderWidth: 2,
                  pointRadius: 0,
                  tension: 0.4
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  display: true
                },
                y: {
                  display: true
                }
              },
              plugins: {
                legend: {
                  display: false
                }
              }
            }
          });
    
          chartInstances.current.push(chart);
        }
      });
    };
    
    // Generate the chart based on the selected chart type
    let data = [];
    if (selectedChart === "consumption") {
      data = Array.isArray(consumption) ? consumption : [];
    } else if (selectedChart === "green") {
      data = Array.isArray(green) ? green : [];
    } else if (selectedChart === "sharing") {
      data = Array.isArray(sharing) ? sharing : [];
    }
    generateChart(data);
  }, [selectedChart]);

  const selectNewChart = (chart) => {
    setSelectedChart(chart);
    document.getElementById('consumption').className = chart == 'consumption' ? '{`${stylesDetails.selectedButton}`}' : '{`${stylesDetails.nonSelectedButton}`}';
    document.getElementById('green').className = chart == 'green' ? 'selectedButton' : 'nonSelectedButton';
    document.getElementById('sharing').className = chart == 'sharing' ? 'selectedButton' : 'nonSelectedButton';
  };

  return (
    <div className={`${stylesDetails.Container}`}>
      {/* HEADER */}
      <Header />
      <div className={`${stylesDetails.Content}`}>
        <h2 id='companyname'></h2>

        {/* DESCRIPTION */}
        <div className={`${stylesDetails.Description}`}>
          <p>{companyData.description}</p>
        </div>

        {/* NFT LIST */}
        <h4>EPCoins</h4>
        <div className={`${stylesDetails.Progressbar}`}>
          <div className={`${stylesDetails.ProgressbarItem}`}>
            <img src='../images/Icon.png'></img>
            <p>02-16-2023</p>
          </div>
          <div className={`${stylesDetails.ProgressbarItem}`}>
            <img src='../images/Icon.png'></img>
            <p>03-16-2023</p>
          </div>
          <div className={`${stylesDetails.ProgressbarItem}`}>
            <img src='../images/Icon.png'></img>
            <p>04-16-2023</p>
          </div>        
          <div className={`${stylesDetails.ProgressbarItem}`}>
            <img src='../images/Icon.png'></img>
            <p>05-16-2023</p>
          </div>
        </div>

        {/* PROGRESS GRAPH */}  
        <div className={`${stylesDetails.ProgressChart}`}>
          <h4>Progress chart</h4>
          <canvas ref={(ref) => graphRefs.current[0] = ref}></canvas>
          <button classname='{`${stylesDetails.selectedButton}' id='consumption' onClick={() => selectNewChart("consumption")}>Consumption</button>
          <button id='green' onClick={() => selectNewChart("green")}>Green</button>
          <button id='sharing' onClick={() => selectNewChart("sharing")}>Sharing</button>
        </div>

      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const dataToSend = { company: 'placeholder', description: '', consumption: 100,  green: 30, sharing: 70};
  
  dataToSend.company = context.query.company;
  dataToSend.description = context.query.description;
  dataToSend.consumption = context.query.consumption;
  dataToSend.green = context.query.green;
  dataToSend.sharing = context.query.sharing;
  
  return {
    props: {
      companyData: dataToSend,
    },
  };
}

export default Detail;