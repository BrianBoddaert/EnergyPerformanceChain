import { useState, useEffect } from 'react';
import styles from '../styles/Table.module.css';

export function Table() {
  const [data, setData] = useState([]);
  const [sortColumn, setSortColumn] = useState('place');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    // Define the data for the table
    const tableData = [
      { place: 1, company: 'Amazon', token: 'CP123' },
      { place: 2, company: 'Microsoft', token: 'CP456' },
      { place: 3, company: 'Google', token: 'CP789' }
    ];
    setData(tableData);
  }, []);

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
              <img src="/Images/Icon.png" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}