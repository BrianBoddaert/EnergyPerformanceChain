import Head from 'next/head'
import styles from '../styles/Home.module.css'
//import GetAllJsonsInFolder from '../apy.js';  

export default function Home({ nftJsons }) {
  const formatPercent = number => 
    `${new Number(number).toFixed(2)}%`

  return (
    <div className={styles.container}>
      <Head>
        <title>EPChain</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`row mt-4 ${styles.jumbotron}`}>
        <div className='col-sm-12'>
          <h1 className={`text-center ${styles.title}`}>Energy Performance Chain</h1>
        </div>
      </div>

      <table className={`table ${styles.table}`}>
        <thead>
          <tr>
            <th>Place</th>
            <th>Company name</th>
            <th>CP Token</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={`rounded-box ${styles.td}`}>#1</td>
            <td className={`rounded-box ${styles.td}`}>Amazon</td>
            <td className={`rounded-box ${styles.td}`}>
              <img src="/Images/Icon.png"/>
            </td>
          </tr>
          <tr>
            <td className={`rounded-box ${styles.td}`}>#2</td>
            <td className={`rounded-box ${styles.td}`}>Google</td>
            <td className={`rounded-box ${styles.td}`}>
              <img src="/Images/Icon.png"/>
            </td>
          </tr>
          <tr>
            <td className={`rounded-box ${styles.td}`}>#3</td>
            <td className={`rounded-box ${styles.td}`}>Apple</td>
            <td className={`rounded-box ${styles.td}`}>
              <img src="/Images/Icon.png"/>
            </td>
          </tr>
          <tr>
            <td className={`rounded-box ${styles.td}`}>#3</td>
            <td className={`rounded-box ${styles.td}`}>Netflix</td>
            <td className={`rounded-box ${styles.td}`}>
              <img src="/Images/Icon.png"/>
            </td>
          </tr>
          <tr>
            <td className={`rounded-box ${styles.td}`}>#3</td>
            <td className={`rounded-box ${styles.td}`}>Disney</td>
            <td className={`rounded-box ${styles.td}`}>
              <img src="/Images/Icon.png"/>
            </td>
          </tr>
          <tr>
            <td className={`rounded-box ${styles.td}`}>#3</td>
            <td className={`rounded-box ${styles.td}`}>Prime</td>
            <td className={`rounded-box ${styles.td}`}>
              <img src="/Images/Icon.png"/>
            </td>
          </tr>
          <tr>
            <td className={`rounded-box ${styles.td}`}>#3</td>
            <td className={`rounded-box ${styles.td}`}>Milka</td>
            <td className={`rounded-box ${styles.td}`}>
              <img src="/Images/Icon.png"/>
            </td>
          </tr>
          <tr>
            <td className={`rounded-box ${styles.td}`}>#3</td>
            <td className={`rounded-box ${styles.td}`}>Coca-Cola</td>
            <td className={`rounded-box ${styles.td}`}>
              <img src="/Images/Icon.png"/>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// export async function getServerSideProps(context) {
//   //const nftJsons = await Promise.resolve(GetAllJsonsInFolder());
//   // const apys = await Promise.all([
//   //   calculateApy(Compound.cDAI, 'DAI'),
//   //   calculateApy(Compound.cUSDC, 'USDC'),
//   //   calculateApy(Compound.cUSDT, 'USDT'),
//   // ]);

//   // return {
//   //   props: {
//   //     nftJsons
//   //   },
//   // }
// }