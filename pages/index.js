import { Header } from './header.js';
import { Table } from './table.js';

import GetAllJsonsInFolder from '../apy.js';  
//import MetaMaskButtonClicked from '../apy.js';

import styles from '../styles/Main.module.css';

export async function getServerSideProps(context) {
  const nftJsons = await Promise.resolve(GetAllJsonsInFolder());

  return {
    props: {
      nftJsons
    },
  }
}

function App({nftJsons }) {
    return (
      <div className={`Container ${styles.Main}`}>
        <div className={`Container ${styles.Container}`}>
            <Header />
            <Table nftJsons={nftJsons} />
        </div>
      </div>
    );
}

export default App;