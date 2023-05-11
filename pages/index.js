import { Header } from './header.js';
import { Table } from './table.js';
import GetAllJsonsInFolder from '../apy.js';  

import styles from '../styles/Main.module.css';

export async function getServerSideProps(context) {
  const nftJsons1 = await Promise.resolve(GetAllJsonsInFolder());
  // const apys = await Promise.all([
  //   calculateApy(Compound.cDAI, 'DAI'),
  //   calculateApy(Compound.cUSDC, 'USDC'),
  //   calculateApy(Compound.cUSDT, 'USDT'),
  // ]);
  const nftJsons = [
    {
      name: 'Apple Inc.',
      image: 'images/Icon.png',
      overall: 8.1,
      consumption: 6.3,
      green: 8.2,
      sharing: 9.0,
    },
    {
      name: 'Coca-Cola Company',
      image: 'images/Icon.png',
      overall: 9.5,
      consumption: 8.7,
      green: 9.1,
      sharing: 9.7,
    },
    {
      name: 'Toyota Motor Corporation',
      image: 'images/Icon.png',
      overall: 7.8,
      consumption: 5.9,
      green: 8.5,
      sharing: 7.5,
    },
    {
      name: 'Amazon.com, Inc.',
      image: 'images/Icon.png',
      overall: 8.3,
      consumption: 7.2,
      green: 7.9,
      sharing: 8.8,
    },
    {
      name: 'Uber Technologies, Inc.',
      image: 'images/Icon.png',
      overall: 3.2,
      consumption: 6.4,
      green: 4.5,
      sharing: 8.6,
    },  {
      name: 'Nike, Inc.',
      image: 'images/Icon.png',
      overall: 2.5,
      consumption: 5.8,
      green: 3.7,
      sharing: 8.5,
    },
  ];

  return {
    props: {
      nftJsons
    },
  }
}

function App({nftJsons }) {
    return (
        <div className={`Container ${styles.Container}`}>
            <Header />
            <Table nftJsons={nftJsons} />
        </div>
    );
}

export default App;