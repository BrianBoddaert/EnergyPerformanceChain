import styles from '../styles/Header.module.css'
import { useEffect } from 'react';

export function Header() {
  useEffect(() => {
  }, []);

    return(
        <div className={`${styles.Main}`}>
          <img className={`${styles.headerBackgroundImage}`} src='Images/HeaderBackground.png'></img>
          <div className={`${styles.headerContent}`}>
            <div className={`${styles.headerImage}`}>
              <img src='Images/LogoTransp.png' />
            </div>
              <h3 className={`${styles.headerTitle}`}>Fair Energy Certification</h3>
            </div>
            <div className={`${styles.buttonsholder}`}>
                  <a href="/"><button>Dashboard</button></a>
                  <a href="/about"><button>About us</button></a>
                  <a href="/register"><button>Register</button></a>
              </div>
        </div>
    );
}