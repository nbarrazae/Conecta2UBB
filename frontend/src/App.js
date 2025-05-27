import React, { useEffect, useState } from 'react';

function App() {
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    fetch('http://192.168.0.23:8000/api/hello/')
      .then(res => res.json())
      .then(data => setMensaje(data.message))
      .catch(err => console.error('Error al obtener el mensaje', err));
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      backgroundColor: '#1e1e2f', 
      color: '#f5f5f5', 
      textAlign: 'center' 
    }}>
      <h1 style={{ fontSize: '3rem', color: '#ff79c6' }}>Hola mundo desde Node + React</h1>
      {mensaje ? (
        <h1 style={{ fontSize: '2rem', color: '#8be9fd' }}>{mensaje}</h1>
      ) : (
        <h1 style={{ fontSize: '2rem', color: '#ff5555' }}>Error: No se pudo cargar el mensaje</h1>
      )}
    </div>
  );
}

export default App;

