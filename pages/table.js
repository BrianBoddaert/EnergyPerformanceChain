import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Table.module.css';
import Chart from 'chart.js/auto';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

export function Table({nftJsons }) {
  const [data, setData] = useState([]);
  const [sortColumn, setSortColumn] = useState('overall');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedColumn, setSelectedColumn] = useState('specific');
  const [selectedOption, setSelectedOption] = useState('overall');
  const graphRefs = useRef([]);

  useEffect(() => {
    // Define the data for the table
    console.log("json: ");

    if (nftJsons && nftJsons.attributes && nftJsons.attributes.length > 0) {
      console.log(nftJsons.attributes[0].energyEfficiency);
    }
    if (nftJsons) 
    {
      const tableData = nftJsons.map((json) => ({
      company: json.name,
      description: json.description,
      token: json.image,
      overall: json.attributes[0].EnergyUsage,
      energyGreen: json.attributes[0].EnergyGreen,
      energySharing: json.attributes[0].EnergySharing,
      energyEfficiency: json.attributes[0].EnergyUsage,
      averageEfficiency: json.attributes[0].AverageSharing,
      averageGreen: json.attributes[0].AverageGreen,
      averageSharing: json.attributes[0].AverageUsage
    }));
    setData(tableData);
  } 

  }, [nftJsons]);

  useEffect(() => {
    graphRefs.current.forEach((ref, index) => {
      const data = generateRandomData();
      const ctx = ref.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['1', '2', '3', '4', '5'],
            datasets: [
              {
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
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
                display: false
              },
              y: {
                display: false
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }
    });
  }, [data]);

  const sortedData = data.slice().sort((a, b) => {
    // Sort based on the selected column and direction
    const direction = sortDirection === 'asc' ? 1 : -1;
    if (sortColumn === 'company') {
      return direction * a.company.localeCompare(b.company);
    } else if (sortColumn === 'consumption') {
      return String(a.energyEfficiency).localeCompare(String(b.energyEfficiency));
    } else if (sortColumn === 'green') {
      return String(b.energyGreen).localeCompare(String(a.energyGreen));
    } else if (sortColumn === 'sharing') {
      return String(b.energySharing).localeCompare(String(a.energySharing));
    } else if (sortColumn === 'overall') {
      return String(b.overall).localeCompare(String(a.overall));
    } else {
      return 0;
    }
  });

  const handleSortColumnClick = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }

    setSelectedColumn(column);
  };

  const handleSelectChange = (event) => {
    const column = event.target.value;
    setSortColumn(column);
    setSelectedColumn("specific");

    const option = event.target.value;
    setSelectedOption(option);
    setSortDirection('asc');
  };

  const forceSelectChange = (column) => {
    setSortColumn(column);
    setSelectedColumn("specific");
    setSortDirection('asc');
  };

  const generateRandomData = () => {
    return Array.from({ length: 5 }, () => Math.random() * 10);
  };

  const handleButtonClick = (data) => {
    // Send data to the new page
    const descr = 'Google LLC is an American multinational technology company focusing on online advertising, search engine technology, cloud computing, computer software, quantum computing, e-commerce, artificial intelligence, and consumer electronics.';
    const consm = Array.from({ length: 5 }, () => data.energyEfficiency + Math.random() * 3);
    const grn = Array.from({ length: 5 }, () => data.energyGreen + Math.random() * 3);
    const shr = Array.from({ length: 5 }, () => data.energySharing + Math.random() * 3);
    
    const dataToSend = { 
      company: data.company, 
      description: descr, 
      consumption: consm,  
      green: grn, 
      sharing: shr
    };
    // Use URL query parameters to pass the data
    const queryParams = new URLSearchParams(dataToSend).toString();
    // Navigate to the new page with the data
    window.location.href = `/details?${queryParams}`;
  };

  return (
    <table className={`${styles.table}`}>
    <thead>
      <tr>
        <th></th>
        <th className={`${styles.filter} ${selectedColumn === 'specific' ? styles.selected : ''}`} onClick={() => forceSelectChange('overall')}>
          <select value={selectedOption} onChange={handleSelectChange}>
            <option value="overall">Overall</option>
            <option value="energyEfficiency">Consumption</option>
            <option value="energyGreen">Green</option>
            <option value="energySharing">Sharing</option>
          </select>
        </th>
        <th className={`${styles.companyHead} ${styles.filter} ${selectedColumn === 'company' ? styles.selected : ''}`} onClick={() => handleSortColumnClick('company')}>Company name</th>
        <th className={`${styles.mainTableHead}`}>CP Token</th>
        <th className={`${styles.graphColumn}`}>Graph</th>
      </tr>
    </thead>
    <tbody>
      {sortedData.map((item, index) => (
        <tr key={index} className={`${index % 2 === 0 ? styles.rowEven : styles.rowOdd}`}>
          <td>#{index + 1}</td>
          <td className={`rounded-box ${styles.td}`}>{item[selectedOption]}</td>
          <td className={`rounded-box ${styles.td} ${styles.makeClicky}`} onClick={() => handleButtonClick(item)}>{item.company}</td>
          <td className={`rounded-box ${styles.td}`}>
            <img src={item.token} alt={item.company} onClick={() => handleImgClick(item)} />
          </td>
          <td className={`${styles.graphh}`}>
            <canvas ref={(ref) => graphRefs.current[index] = ref}></canvas>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
  );
}

function handleImgClick(item)
{
  const id = item.token.match(/\/(\d+)\.png$/)[1];
  let NFTMintURL = "https://volta-explorer.energyweb.org/token/0x71bc9d2dd32c5b1c4ffaedba5350ee348085fc70/instance/" + id + "/token-transfers"; //TODO: make a global var out of the smart contract address and access here
  window.open(NFTMintURL);
}