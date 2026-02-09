import { useState } from 'react'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './App.css'

export const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [data, setData] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [logged, setLogged] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sha256 = async(message) =>{
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b =>b.toString(16).padStart(2, '0')).join('');
  }

  const handleLogin = async () => {
    try {
      setErrorMsg('');
      // 1. Salt lekérése felhasználónév alapján:
      const saltResponse = await axios.get(`https://localhost:7087/api/Login/GetSalt?username=${username}`);
      const salt = saltResponse.data; // feltesszük, hogy sima string érkezik salt-ként
      console.log("salt: ",salt);      
      // 2. Jelszó + Salt konkatenálása és hash-elése
      const saltedPassword = password + salt;
      const hashedPassword = await sha256(saltedPassword);
       console.log("Salt+pwd: ",saltedPassword);
      console.log("Hashelt verzió: ",hashedPassword);
      // 3. Login indítása a hash-elt értékkel:
      const loginResponse = await axios.post(`https://localhost:7087/api/Login/Login`, {
        loginName: username,
        hash: hashedPassword,
      }
      )

      const receivedToken=loginResponse.data;
      setToken(receivedToken);
      console.log("Token: ", receivedToken);
      setLogged(true);
      const decoded = jwtDecode(receivedToken);
      console.log("Dekódolt token: ", decoded);
      setTokenData(decoded);
    } catch (error) {
      console.error("Hitelesítés sikertelen: ",error);
      setErrorMsg("Sikertelen bejelentkezés vagy hálózati hiba!");
    }
  };

  

  return (
      <div style={{padding: '28px' }}>
          {token ? (
        <div>
          <h1>Be van jelentkezve - Üdvözöljük!</h1>
          <div style={{ marginTop: '28px', border: '1px solid #ccc', padding: '15px'}}>
          <h2>A munkamenet adatai</h2>
          {tokenData ? (
            <>
            <p>Felhasználó: {tokenData.username}</p>
            <p>Lejárat: {tokenData.exp ? new Date(tokenData.exp*1000).toLocaleString('hu-HU') 
              : ("Nincs lejárat!")}</p>
            </>
          ) : (<p>Adatok betöltése <span className="spinner-border"></span></p>)}

        </div>
        <br />
        <button onClick={() =>{ setToken(''); setData(null);}}>Kijelentkezés</button>
        </div>
      ) : (
         <div><h1>Bejelentkezés</h1>
        Felhasználó: <input type="text"
        placeholder='felhasználónév'
        value={username}
        onChange={(event) => setUsername(event.target.value) } /> <br />
        Jelszó: <input type="password"
        placeholder='jelszó'
        value={password}
      onChange={(event) => setPassword(event.target.value) } /> <br />
      <button onClick={handleLogin}>Bejelentkezés</button>
      </div>
        )
        }
      </div>
  );
};
