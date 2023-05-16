import { Header } from './header.js';

import styles from '../styles/Main.module.css';

function App() {
    return (
        <div className={`Container ${styles.Container}`}>
            <Header />
            
            We do stuff

        </div>
    );
}

export default App;