import { Header } from './header.js';
import { Table } from './table.js';
import GetAllJsonsInFolder from '../apy.js';  

import styles from '../styles/Main.module.css';

export async function getServerSideProps(context) {
  const nftJsons = await Promise.resolve(GetAllJsonsInFolder());
  // const apys = await Promise.all([
  //   calculateApy(Compound.cDAI, 'DAI'),
  //   calculateApy(Compound.cUSDC, 'USDC'),
  //   calculateApy(Compound.cUSDT, 'USDT'),
  // ]);

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