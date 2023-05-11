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

  return (
    <table className={`table ${styles.table}`}>
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
          <th className={`${styles.mainTableHead} ${styles.filter} ${selectedColumn === 'company' ? styles.selected : ''}`} onClick={() => handleSortColumnClick('company')}>Company name</th>
          <th className={`${styles.mainTableHead}`}>CP Token</th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((item, index) => (
          <tr key={index} className={`${index % 2 === 0 ? styles.rowEven : styles.rowOdd}`}>
            <td> #{index + 1} </td>
            <td className={`rounded-box ${styles.td} ${styles.rowEven}`}>{item[selectedOption]}</td>
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

