import { useState, useEffect } from 'react';
import styles from '../styles/Table.module.css';

export function Table({nftJsons }) {
  const [data, setData] = useState([]);
  const [sortColumn, setSortColumn] = useState('overall');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedColumn, setSelectedColumn] = useState('specific');
  const [selectedOption, setSelectedOption] = useState('overall');

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

  const sortedData = data.slice().sort((a, b) => {
    // Sort based on the selected column and direction
    const direction = sortDirection === 'asc' ? 1 : -1;
    if (sortColumn === 'company') {
      return direction * a.company.localeCompare(b.company);
    } else if (sortColumn === 'consumption') {
      return direction * String(a.consumption).localeCompare(String(b.consumption));
    } else if (sortColumn === 'green') {
      return direction * String(a.green).localeCompare(String(b.green));
    } else if (sortColumn === 'sharing') {
      return direction * String(a.sharing).localeCompare(String(b.sharing));
    } else if (sortColumn === 'overall') {
      return direction * String(a.overall).localeCompare(String(b.overall));
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

  return (
    <table className={`table ${styles.table}`}>
      <thead>
        <tr>
          <th className={`rounded-box ${styles.filter} ${selectedColumn === 'specific' ? styles.selected : ''}`} onClick={() => forceSelectChange('overall')}> 
            <select value={selectedOption} onChange={handleSelectChange}>
              <option value="overall">Overall</option>
              <option value="consumption">Consumption</option>
              <option value="green">Green</option>
              <option value="sharing">Sharing</option>
            </select>
          </th>
          <th className={`rounded-box ${styles.filter} ${selectedColumn === 'company' ? styles.selected : ''}`} onClick={() => handleSortColumnClick('company')}>Company name</th>
          <th>CP Token</th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item, index) => (
          <tr key={index}>
            <td className={`rounded-box ${styles.td}`}>{item[selectedOption]}</td>
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

