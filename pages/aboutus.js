import styles from '../styles/AboutUs.module.css'
import { useEffect } from 'react';

export function AboutUs() {
  useEffect(() => {
  }, []);

    return(
        <div className={`${styles.Main}`}>
          <img className={`${styles.BackgroundImage}`} src='Images/AboutUsBackground.png'></img>
          <div className={`${styles.Header}`}>
            The most trustworthy and reliable energy certification
          </div>
          <div className={`${styles.Content}`}>
            <div className={`${styles.ContentOne}`}>
              <h3>What do we do</h3>
              <div className={`${styles.Line}`}/>
              <p>
                We are pioneers in the realm of energy rating and certification, leveraging state-of-the-art 
                blockchain technology. Our cutting-edge approach ensures unparalleled security and trust in the 
                evaluation of corporate energy usage. With meticulous data analysis and advanced algorithms, 
                we compare companies' energy efficiency, identifying industry leaders. Our prestigious certificates 
                validate their dedication to sustainable practices, inspiring others to follow suit.
              </p>
              <h3>How do we do it</h3>
              <div className={`${styles.Line}`}/>
              <p>
                Every month we generate a new set of dynamicly created NFT's. The colors in this NFT determine your position
                in the energy ranking. By adding up all the energy data from all the registered companies we calculate the avarge
                for the different energy sectors. These are <b>Energy consumptionm, Green Energy and Energy Sharing</b>
                This doesn't just show how well a comapny is doing, but also how well he is doing in improving throughout the months. 
              </p>
            </div>
            <div className={`${styles.ContentTwo}`}>
            <div className={`${styles.ImagesContainer}`}>
              <img className={`${styles.Image2}`} src='Images/Details.png'></img>
              <img className={`${styles.Image1}`} src='Images/ProgressionOverview.png'></img><br />
              </div>
            </div>
          </div>
        </div>
    );
}