import styles from '../styles/Header.module.css'
import { useEffect } from 'react';

export function Header() {
  useEffect(() => {
    const body = document.body;
    body.style.backgroundImage = 'var(--background-image-light)';

    const toggleMode = () => {
      const isDarkMode = body.classList.toggle('dark-mode');
      const textElement = document.querySelector('.text-element');

      // Change background image based on mode
      const backgroundImage = isDarkMode ? 'var(--background-image-dark)' : 'var(--background-image-light)';
      body.style.backgroundImage = backgroundImage;

      // Change text color based on mode
      const textColor = isDarkMode ? 'var(--text-color-light)' : 'var(--text-color-dark)';
      body.style.color = textColor;

      textElement.src = isDarkMode ? 'Images/lightoff.png' : 'Images/lighton.png';
    };

    const textElement = document.querySelector('.text-element');
    textElement.addEventListener('click', toggleMode);

    return () => {
      textElement.removeEventListener('click', toggleMode);
    };
  }, []);

    return(
        <div className={`row mt-4 ${styles.Main}`}>
            <div>
                <img src='Images/lighton.png' className={`text-element ${styles.lightmode}`} />
                <div className={`row mt-4 ${styles.headerbackground}`}>
                    <div className='col-sm-12'>
                        <img src='Images/LogoTransp.png' />
                    </div>
                </div>
            </div>
            <div className={`${styles.buttonsholder}`}>
                <a href="/"><button>Dashboard</button></a>
                <a href="/about"><button>About us</button></a>
                <a href="/faq"><button>FAQ</button></a>
            </div>
        </div>
    );
}