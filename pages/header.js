import styles from '../styles/Header.module.css'

export function Header() {
    return(
        <div>
            <div className={`row mt-4 ${styles.headerbackground}`}>
                <div className='col-sm-12'>
                    <img src='Images/LogoTransp.png' />
                </div>
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