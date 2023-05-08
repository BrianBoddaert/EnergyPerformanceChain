import styles from '../styles/Home.module.css'

export function Table() {
    return(
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
    );
}