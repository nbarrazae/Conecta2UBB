import { useEffect, useState } from 'react'

function App() {
  const [mensaje, setMensaje] = useState('Cargando...')

  useEffect(() => {
    fetch('/api/hello/')
      .then((res) => res.json())
      .then((data) => setMensaje(data.message))
      .catch((err) => {
        console.error('Error al obtener el mensaje:', err)
        setMensaje('No se pudo conectar con Django')
      })
  }, [])

  return (
    <div style={{
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      height: '100vh', 
      width: '100vw', 
      flexDirection: 'column', 
      backgroundColor: '#1e1e2f', 
      color: '#fff',
      padding: '1rem',
      boxSizing: 'border-box',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', color: '#ff79c6', margin: '0.5rem' }}>
        Hola mundo desde Vite + React
      </h1>
      <h2 style={{ fontSize: '1.5rem', color: '#8be9fd', margin: '0.5rem' }}>
        {mensaje}
      </h2>
    </div>
  )
}

export default App
