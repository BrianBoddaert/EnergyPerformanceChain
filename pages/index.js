import { Header } from './header.js';
import { Table } from './table.js';

import styles from '../styles/Main.module.css';

import GetAllJsonsInFolder from '../apy.js';  


export async function getServerSideProps(context) {
  const nftJsons = await Promise.resolve(GetAllJsonsInFolder());

  return {
    props: {
      nftJsons
    },
  }
}

function App({nftJsons })
{
  const handleMetaMaskButtonClick = () => {
    MetaMaskButtonClicked();
  };

    return (
        <div className={`Container ${styles.Container}`}>
            <Header />
            <Table nftJsons={nftJsons} />
        </div>
    );
}

export default App;