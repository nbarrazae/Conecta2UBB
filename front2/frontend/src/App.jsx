import {  useState } from 'react'
import './App.css'
import Home from './components/Home'
import Register from './components/Register'
import Login from './components/Login'
import Navbar from './components/Navbar'
import About from './components/About'
import { Routes, Route, useLocation } from 'react-router-dom'  
import ProtectedRoutes from './components/ProtectedRoutes'

function App() {
  const location = useLocation();
  const noNavbar = location.pathname === '/login' || location.pathname === '/register';

  

  return (

    <>
    {
      noNavbar ?
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      
      :
      <Navbar
      content = {
        <Routes>
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
