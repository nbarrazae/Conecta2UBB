import "./App.css";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import About from "./components/About";
import PasswordResetRquest from "./components/PasswordResetRequest";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import ProtectedRoutes from "./components/ProtectedRoutes";
import PasswordReset from "./components/PasswordReset";
import NotFound from "./components/NotFound";
import CrearEvento from "./components/CrearEvento";
import VerEvento from './components/VerEvento'
import AdminReports from "./components/AdminReports";
import Perfil from "./components/Perfil/Perfil";
import BuscarEventos from "./components/Buscar/BuscarEventos";

function App() {
  const location = useLocation();
  const path = location.pathname;

  // Rutas sin Navbar
  const noNavbarRoutes = [
    '/',
    '/login',
    '/register',
    '/request/password_reset',
  ];
  const isReset = path.startsWith('/password-reset/');


  const showWithoutNavbar = noNavbarRoutes.includes(path) || isReset;

  // Rutas válidas con Navbar
  const validProtectedRoutes = [
    "/home",
    "/about",
    "/crear-evento",
    "/ver-evento",
    "/admin-reports",
    "/perfil",
    "/perfil-publico", // 👈 añadida base para detectar
    "/buscar",
  ];

  const isValidProtected = validProtectedRoutes.some((route) =>
    path.startsWith(route)
  );

  const isAdmin = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.is_staff || user.is_superuser;
  };

  if (showWithoutNavbar) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/request/password_reset"
          element={<PasswordResetRquest />}
        />
        <Route path="/password-reset/:token" element={<PasswordReset />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // Ruta protegida válida: con Navbar
  if (isValidProtected) {
    return (
      <Navbar
        content={
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/home" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/crear-evento" element={<CrearEvento />} />
              <Route path="/ver-evento/:id" element={<VerEvento />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/perfil-publico/:username" element={<Perfil />} />
              <Route path="/buscar" element={<BuscarEventos />} />
              {isAdmin() && (
                <Route path="/admin-reports" element={<AdminReports />} />
              )}
            </Route>
          </Routes>
        }
      />
    );
  }

  // if (showWithoutNavbar) {
  //   return (
  //     <Routes>
  //       <Route path="/" element={<Navigate to="/login" replace />} />
  //       <Route path="/login" element={<Login />} />
  //       <Route path="/register" element={<Register />} />
  //       <Route path="/request/password_reset" element={<PasswordResetRquest />} />
  //       <Route path="/password-reset/:token" element={<PasswordReset />} />
  //       <Route path="*" element={<NotFound />} />
  //     </Routes>
  //   );
  // }

  // Ruta desconocida sin Navbar
  return <NotFound />;
}

export default App;
