import styles from '../styles/Header.module.css'
import { useEffect } from 'react';

export function Header() {
  useEffect(() => {
    const body = document.body;
    //body.style.backgroundImage = 'var(--background-image-light)';

  //   const toggleMode = () => {
  //     const isDarkMode = body.classList.toggle('dark-mode');
  //     const textElement = document.querySelector('.text-element');

  //     // Change background image based on mode
  //     //const backgroundImage = isDarkMode ? 'var(--background-image-dark)' : 'var(--background-image-light)';
  //     //body.style.backgroundImage = backgroundImage;

  //     // Change text color based on mode
  //     //const textColor = isDarkMode ? 'var(--text-color-light)' : 'var(--text-color-dark)';
  //     //body.style.color = textColor;

  //     //textElement.src = isDarkMode ? 'Images/lightoff.png' : 'Images/lighton.png';
  //   };

  //   // <img src='Images/lighton.png' className={`text-element ${styles.lightmode}`} />

  //   const textElement = document.querySelector('.text-element');
  //   textElement.addEventListener('click', toggleMode);

  //   return () => {
  //     textElement.removeEventListener('click', toggleMode);
  //   };
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
                  <a href="/faq"><button>FAQ</button></a>
                  <a href="/register"><button>Register</button></a>
              </div>
        </div>
    );
}