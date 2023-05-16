import {React, useState, useEffect, useRef} from 'react';
import { Header } from './header.js';
import Chart from 'chart.js/auto';


import styles from '../styles/Main.module.css';
import stylesDetails from '../styles/Details.module.css';


function Detail({ companyData }) {
  const [data] = useState([]);
  const graphRefs = useRef([]);
  const chartInstances = useRef([]);

  useEffect(() => {
    const destroyChartInstances = () => {
      chartInstances.current.forEach((chart) => {
        chart.destroy();
      });
      chartInstances.current = [];
    };

    destroyChartInstances();

    graphRefs.current.forEach((ref, index) => {
      const data = generateRandomData();
      const ctx = ref.getContext('2d');
      if (ctx) {
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['1', '2', '3', '4', '5'],
            datasets: [
              {
                data: data,
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
  }, [data]);

  const generateRandomData = () => {
    return Array.from({ length: 5 }, () => Math.random() * 10);
  };

  return (
    <div className={`Container ${styles.Container}`}>
      {/* HEADER */}
      <Header />
      <h2>{companyData.company}</h2>

      {/* DESCRIPTION */}
      <div className={`Container ${stylesDetails.Description}`}>
        <p>{companyData.description}</p>
      </div>

      {/* NFT LIST */}
      <h4>EPCoins</h4>
      <div className={`Container ${stylesDetails.Progressbar}`}>
        <div className={`Container ${stylesDetails.ProgressbarItem}`}>
          <img src='../images/Icon.png'></img>
          <p>02-16-2023</p>
        </div>
        <div className={`Container ${stylesDetails.ProgressbarItem}`}>
          <img src='../images/Icon.png'></img>
          <p>03-16-2023</p>
        </div>
        <div className={`Container ${stylesDetails.ProgressbarItem}`}>
          <img src='../images/Icon.png'></img>
          <p>04-16-2023</p>
        </div>        
        <div className={`Container ${stylesDetails.ProgressbarItem}`}>
          <img src='../images/Icon.png'></img>
          <p>05-16-2023</p>
        </div>
      </div>

      {/* PROGRESS GRAPH */}  
      <div className={`Container ${stylesDetails.ProgressChart}`}>
        <h4>Progress chart</h4>
        <canvas ref={(ref) => graphRefs.current[0] = ref}></canvas>
        <button className={`${stylesDetails.selectedButton}`}>Overall</button>
        <button>Consumption</button>
        <button>Green</button>
        <button>Sharing</button>
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