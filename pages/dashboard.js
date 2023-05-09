import { Header } from './header.js';
import { Table } from './table.js';

import styles from '../styles/Main.module.css';

function App() {
    return (
        <div className={`Container ${styles.Container}`}>
            <Header />
            <Table />
        </div>
    );
}

export default App;