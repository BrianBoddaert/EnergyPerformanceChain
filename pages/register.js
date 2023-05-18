import { Header } from './header.js';

import styles from '../styles/Main.module.css';

//import React from 'react';

//import MetaMaskButtonClicked from '../apy.js';

function App() 
{
    async function loginWithMetaMask()
    {
        const metaMaskButton = document.getElementById('metamaskbutton');
        const hiddenText = document.getElementById('hiddenText');
        const metaMaskAddressText = document.getElementById('metamaskaddresstext');

        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        .catch((e) => {
            return;
        })
        if (!accounts)
        {
            return;
        }

        window.userwalletAddress = accounts[0];
        hiddenText.removeAttribute("hidden");
        metaMaskAddressText.innerText = accounts[0];
        metaMaskButton.innerText = 'Metamask is linked';
    }

    const handleButtonClick = async () => 
    {
        const metaMaskButton = document.getElementById('metamaskbutton');
        if (!window.ethereum)
        {
          metaMaskButton.innerText = 'No access to MetaMask in your browser';
          return;
        }
        else
        {
            loginWithMetaMask();
        }
    };

    return (
        <div className={`Container ${styles.Container}`}>
            <Header />
            
            <h2>Register</h2><br/>
            <div id='hiddenText' hidden>
            <p>Successfully linked metamask address!</p>
            <p id='metamaskaddresstext'></p>
            <p>Open your metamask browser addon and click "connected" if you want to disconnect</p>
            </div>
            

            <button onClick={handleButtonClick} id='metamaskbutton'>Link Metamask</button><br/>

            <form>     
                <label>Company name:</label><br/>
                <input type="text" id="cname" name="cname"/><br/>
                <label>Industry:</label><br/>
                <select name="industry" id="industry">
                    <option value="Agriculture and Forestry">Agriculture and Forestry</option>
                    <option value="Mining and Extraction">Mining and Extraction</option>
                    <option value="Construction and Engineering">Construction and Engineering</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Energy and Utilities">Energy and Utilities</option>
                    <option value="IT">IT</option>
                    <option value="Telecommunications">Telecommunications</option>
                    <option value="Wholesale and Retail Trade">Wholesale and Retail Trade</option>
                    <option value="Transportation and Logistics">Transportation and Logistics</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Finance and Insurance">Finance and Insurance</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Management and Accounting">Management and Accounting</option>
                    <option value="Human resources">Human resources</option>
                    <option value="Education and Training">Education and Training</option>
                    <option value="Healthcare and Social Assistance">Healthcare and Social Assistance</option>
                    <option value="Arts, Entertainment, and RecreationIT">Arts, Entertainment, and Recreation</option>
                    <option value="Media and Communication">Media and Communication</option>
                    <option value="Government and Public Administration">Government and Public Administration</option>
                    <option value="Nonprofit and Philanthropy">Nonprofit and Philanthropy</option>
                    <option value="Military and Defense">Military and Defense</option>
                </select><br/><br/>
                <button id='submitButton'>Submit</button><br/>
            </form><br/>

            
        </div>
    );
}

export default App;