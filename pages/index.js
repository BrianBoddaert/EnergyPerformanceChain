import { Header } from './header.js';
import { Table } from './table.js';

import styles from '../styles/Main.module.css';

const nftJsons = [
  {
    name: 'Company A',
    image: 'https://via.placeholder.com/150',
    overall: 8.1,
    consumption: 6.3,
    green: 8.2,
    sharing: 9.0,
  },
  {
    name: 'Company B',
    image: 'https://via.placeholder.com/150',
    overall: 9.5,
    consumption: 8.7,
    green: 9.1,
    sharing: 9.7,
  },
  {
    name: 'Company C',
    image: 'https://via.placeholder.com/150',
    overall: 7.8,
    consumption: 5.9,
    green: 8.5,
    sharing: 7.5,
  },
  {
    name: 'Company D',
    image: 'https://via.placeholder.com/150',
    overall: 8.3,
    consumption: 7.2,
    green: 7.9,
    sharing: 8.8,
  },
  {
    name: 'Company E',
    image: 'https://via.placeholder.com/150',
    overall: 9.2,
    consumption: 8.6,
    green: 9.3,
    sharing: 8.9,
  },
];

function App() {
    return (
      
        <div className={`Container ${styles.Container}`}>
            <Header />
            <Table nftJsons={nftJsons}  />
        </div>
    );
}

export default App;

