import { Header } from './header.js';
import { Table } from './table.js';
import GetAllJsonsInFolder from '../apy.js';  

import styles from '../styles/Main.module.css';

const nftJsons = [
  {
    name: 'Company A',
    image: 'images/Icon.png',
    overall: 8.1,
    consumption: 6.3,
    green: 8.2,
    sharing: 9.0,
  },
  {
    name: 'Company B',
    image: 'images/Icon.png',
    overall: 9.5,
    consumption: 8.7,
    green: 9.1,
    sharing: 9.7,
  },
  {
    name: 'Company C',
    image: 'images/Icon.png',
    overall: 7.8,
    consumption: 5.9,
    green: 8.5,
    sharing: 7.5,
  },
  {
    name: 'Company D',
    image: 'images/Icon.png',
    overall: 8.3,
    consumption: 7.2,
    green: 7.9,
    sharing: 8.8,
  },
  {
    name: 'Company E',
    image: 'images/Icon.png',
    overall: 9.2,
    consumption: 8.6,
    green: 9.3,
    sharing: 8.9,
  },
];

// export async function getServerSideProps(context) {
//   const nftJsons = await Promise.resolve(GetAllJsonsInFolder());
//   // const apys = await Promise.all([
//   //   calculateApy(Compound.cDAI, 'DAI'),
//   //   calculateApy(Compound.cUSDC, 'USDC'),
//   //   calculateApy(Compound.cUSDT, 'USDT'),
//   // ]);


//   return {
//     props: {
//       nftJsons
//     },
//   }
// }

function App({nftJsons }) {
    return (
        <div className={`Container ${styles.Container}`}>
            <Header />
            <Table nftJsons={nftJsons} />
        </div>
    );
}

export default App;