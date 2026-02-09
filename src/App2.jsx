import { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './App.css';

export const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [data, setData] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Segédfüggvény az SHA256 hasheléshez
  const sha256 = async (message) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async () => {
    try {
      setErrorMsg('');
      
      // 1. Salt lekérése a felhasználónév alapján
      const saltResponse = await axios.get(`https://localhost:7087/api/Login/GetSalt?username=${username}`);
      const salt = saltResponse.data; // Feltételezzük, hogy sima string érkezik

      // 2. Jelszó + Salt konkatenálása és hashelése
      const saltedPassword = password + salt;
      const hashedPassword = await sha256(saltedPassword);

      // 3. Login indítása a hash-elt értékkel
      const loginResponse = await axios.post('https://localhost:7087/api/Login/Login', {
        loginName: username,
        password: hashedPassword, // Csak a hash-t küldjük!
      });

      const receivedToken = loginResponse.data.token;
      setToken(receivedToken);
      
      // 4. Token dekódolása
      const decoded = jwtDecode(receivedToken);
      setTokenData(decoded);
      
    } catch (error) {
      console.error("Hiba a folyamat során:", error);
      setErrorMsg("Sikertelen bejelentkezés vagy hálózati hiba.");
    }
  };

  return (
    <div style={{ padding: '28px' }}>
      {token ? (
        <div>
          <h1>Üdvözöljük!</h1>
          <div style={{ marginTop: '28px', border: '1px solid #ccc', padding: '15px' }}>
            <h2>Munkamenet adatai</h2>
            {tokenData ? (
              <>
                <p><strong>Felhasználó:</strong> {tokenData.unique_name || tokenData.username}</p>
                <p><strong>Lejár:</strong> {new Date(tokenData.exp * 1000).toLocaleString('hu-HU')}</p>
              </>
            ) : <p>Dekódolás...</p>}
          </div>
          <button onClick={() => { setToken(''); setTokenData(null); }}>Kijelentkezés</button>
        </div>
      ) : (
        <div>
          <h1>Bejelentkezés</h1>
          {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
          <input 
            type="text" 
            placeholder="Felhasználónév" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          /><br />
          <input 
            type="password" 
            placeholder="Jelszó" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          /><br />
          <button onClick={handleLogin}>Bejelentkezés</button>
        </div>
      )}
    </div>
  );
};
