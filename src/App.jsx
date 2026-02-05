import { useState } from 'react'
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './App.css'

export const App = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [data, setData] = useState('');
  const [tokenData, setTokenData] = useState(null); // itt tároljuk a dekódolt Token adatokat!
  const [logged, setLogged] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://jwtexp.sulla.hu/login', {
        username,
        password,
      });
      const receivedToken = response.data.token;
      setToken(receivedToken);
      console.log("Token: ", receivedToken);
      setLogged(true);
      const decoded = jwtDecode(receivedToken);
      setTokenData(decoded);
      console.log("Dekódolt token: ", decoded);
    } catch (error) {
      console.error("Hitelesítés sikertelen: ",error);
    }
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('https://jwtexp.sulla.hu/termekek', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setData(response.data);
      console.log("Végpont adatok: ", response.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        alert('Lejárt a munkamenet, jelentkezz be újra!');
        setToken('');
      }
      console.error("Végpont lekérdezés sikertelen: ",error);
    
  }};

  return (
      <div style={{padding: '28px' }}>
          {token ? (
        <div>
          <h1>Be van jelentkezve - Üdvözöljük!</h1>
          <div style={{ marginTop: '28px', border: '1px solid #ccc', padding: '15px'}}>
          <h2>A munkamenet adatai</h2>
          {tokenData ? (
            <>
              <p><strong>Felhasználó:</strong> {tokenData.username}</p>
              <p><strong>Bejelentkezve:</strong> {new Date(tokenData.iat*1000).toLocaleString('hu-HU')}</p>
              <p><strong>Lejár:</strong> {tokenData.exp ? new Date(tokenData.exp*1000).toLocaleString('hu-HU') : ("Nincs lejárat!")}</p>
            </>
          ) : ( <p>Adatok betöltése...</p>)}
          <button onClick={fetchData}>Végpont lekérdezés</button>
          {data && (
            <ul>
              {data.map((item) => (
                <li key={item.id}> {item.id} - {item.name} - {item.price} </li>
              ))}
            </ul>
          )}
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
