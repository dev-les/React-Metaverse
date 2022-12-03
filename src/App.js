import logo from './logo.svg';
import './App.css';
import 'aframe';
import React, { useState, useEffect } from 'react';
import World from './test';
import Login from './Login'
function App() {
  const [token, setToken] = useState('');

  useEffect(() => {

    async function getToken() {
      const response = await fetch('/auth/token');
      const json = await response.json();
      setToken(json.access_token);
    }

    getToken();

  }, []);

  return (
    <>
    { (token === '') ? <Login/> : <World token={token} /> }
    </>
  );
}

export default App;
