import { Header } from './header.js';
import { Table } from './table.js';
import { AboutUs } from './aboutus.js';
import { Info } from './info.js';

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
            <AboutUs />
            <Info />
        </div>
      </div>
    );
}

export default App;