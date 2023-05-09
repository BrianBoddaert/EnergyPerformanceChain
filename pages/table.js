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
    if (sortColumn === 'place') {
      return direction * (a.place - b.place);
    } else if (sortColumn === 'company') {
      return direction * a.company.localeCompare(b.company);
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

  return (
    <table className={`table ${styles.table}`}>
      <thead>
        <tr>
          <th className={`rounded-box ${styles.filter}`} onClick={() => handleSortColumnClick('place')}>Place</th>
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

