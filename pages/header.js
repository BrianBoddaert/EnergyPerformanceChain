import styles from '../styles/Home.module.css'

export function Header() {
    return(
        <div className={`row mt-4 ${styles.jumbotron}`}>
            <div className='col-sm-12'>
                <h1 className={`text-center ${styles.title}`}>Energy Performance Chain</h1>
            </div>
        </div>
    );
}