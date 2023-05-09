import { useState, useEffect } from 'react';
import styles from '../styles/Table.module.css';

export function Table({nftJsons }) {
  const [data, setData] = useState([]);
  const [sortColumn, setSortColumn] = useState('place');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    // Define the data for the table
    if (nftJsons) {
    const tableData = nftJsons.map((json, index) => ({
      place: index + 1,
      company: json.name,
      token: json.image
    }));
    setData(tableData);
  } 
    
  }, [nftJsons]);

  const sortedData = data.slice().sort((a, b) => {
    // Sort based on the selected column and direction
    const direction = sortDirection === 'asc' ? 1 : -1;
if (sortColumn === 'company') {
      return direction * a.company.localeCompare(b.company);
    } else if (sortColumn === 'consumption') {
      return direction * (a.consumption - b.consumption);
    } else if (sortColumn === 'green') {
      return direction * (a.green - b.green);
    } else if (sortColumn === 'sharing') {
      return direction * (a.sharing - b.sharing);
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
  };

  const handleSelectChange = (event) => {
    const column = event.target.value;
    handleSortColumnClick(column);
  };

  return (
    <table className={`table ${styles.table}`}>
      <thead>
        <tr>
          <th className={`rounded-box ${styles.filter}`}> 
            <select value={sortColumn} onChange={handleSelectChange}>
              <option value="place">Overall</option>
              <option value="consumption">Consumption</option>
              <option value="green">Green</option>
              <option value="sharing">Sharing</option>
            </select>
          </th>
          <th className={`rounded-box ${styles.filter}`} onClick={() => handleSortColumnClick('company')}>Company name</th>
          <th>CP Token</th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item, index) => (
          <tr key={index}>
            <td className={`rounded-box ${styles.td}`}>{item.place}</td>
            <td className={`rounded-box ${styles.td}`}>{item.company}</td>
            <td className={`rounded-box ${styles.td}`}>
              <img src={item.token}/>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

