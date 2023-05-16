import { Header } from './header.js';

import styles from '../styles/Main.module.css';

//import MetaMaskButtonClicked from '../apy.js';

function App() {

    // useEffect(() => {
    //     const button = document.getElementById('metamaskbutton');
    //     button.addEventListener('click', MetaMaskButtonClicked);
        
    //     return () => {
    //         button.removeEventListener('click', MetaMaskButtonClicked);
    //     };
    // }, []);

    return (
        <div className={`Container ${styles.Container}`}>
            <Header />
            
            Register
            <form> 
                <button id='metamaskbutton'> Link Metamask </button><br/>
                <label for="fname">First name:</label><br/>
                <input type="text" id="fname" name="fname" value=""/><br/>
                <label for="lname">Last name:</label><br/>
                <input type="text" id="lname" name="lname" value=""/>
            </form>
        </div>
    );
}

export default App;