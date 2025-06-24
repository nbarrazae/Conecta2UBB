import {  useState } from 'react'
import './App.css'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Navbar from './components/Navbar'
import About from './components/About'
import PasswordResetRquest from './components/PasswordResetRequest'
import { Routes, Route, useLocation } from 'react-router-dom'  
import ProtectedRoutes from './components/ProtectedRoutes'
import PasswordReset from './components/PasswordReset'
import { Navigate } from 'react-router-dom'

function App() {
  const location = useLocation();
  const noNavbar = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/request/password_reset' || location.pathname.startsWith('/password-reset/');


  

  return (

    <>
    {
  noNavbar ?
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/request/password_reset" element={<PasswordResetRquest />} />
      <Route path="/password-reset/:token" element={<PasswordReset />} />
    </Routes>
  :
    <Navbar
      content = {
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route element={<ProtectedRoutes />}>
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Routes>
      }
    />
}

    
    </>

  )

    
    
}

export default App
