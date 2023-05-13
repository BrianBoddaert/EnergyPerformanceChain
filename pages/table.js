import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Table.module.css';
import Chart from 'chart.js/auto';

export function Table({nftJsons }) {
  const [data, setData] = useState([]);
  const [sortColumn, setSortColumn] = useState('overall');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedColumn, setSelectedColumn] = useState('specific');
  const [selectedOption, setSelectedOption] = useState('overall');
  const graphRefs = useRef([]);

  useEffect(() => {
    // Define the data for the table
    if (nftJsons) 
    {
      const tableData = nftJsons.map((json) => ({
      company: json.name,
      token: json.image,
      overall: json.overall,
      consumption: json.consumption,
      green: json.green,
      sharing: json.sharing
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
      return String(a.consumption).localeCompare(String(b.consumption));
    } else if (sortColumn === 'green') {
      return String(b.green).localeCompare(String(a.green));
    } else if (sortColumn === 'sharing') {
      return String(b.sharing).localeCompare(String(a.sharing));
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

  return (
    <table className={`${styles.table}`}>
    <thead>
      <tr>
        <th></th>
        <th className={`${styles.filter} ${selectedColumn === 'specific' ? styles.selected : ''}`} onClick={() => forceSelectChange('overall')}>
          <select value={selectedOption} onChange={handleSelectChange}>
            <option value="overall">Overall</option>
            <option value="consumption">Consumption</option>
            <option value="green">Green</option>
            <option value="sharing">Sharing</option>
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
          <td className={`rounded-box ${styles.td}`}>{item.company}</td>
          <td className={`rounded-box ${styles.td}`}>
            <img src={item.token} alt={item.company} />
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

