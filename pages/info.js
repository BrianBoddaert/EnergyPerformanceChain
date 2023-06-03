import styles from '../styles/Info.module.css'
import { useEffect } from 'react';

export function Info() {
  useEffect(() => {
  }, []);

    return(
        <div className={`${styles.Main}`}>
          <div className={`${styles.Header}`}>
            Get in touch and improve you company image!
          </div>
          <div className={`${styles.Content}`}>
            <button>Register</button>
          </div>

          <img className={`${styles.BackgroundImage}`} src='Images/FooterBackground.png'></img>

        </div>
    );
}