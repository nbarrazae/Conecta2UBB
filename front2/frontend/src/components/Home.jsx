import AxiosInstance from "./axiosInstance";
import { React, useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BotonInscripcion from "./BotonInscripcion";
import EventoPostCard from "./EventoPostCard";
import "./Home.css";
import BarraBusqueda from "./BarraBusqueda";

const Home = () => {
  const [myData, setMyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [Events, setEvents] = useState([]);
  const navigate = useNavigate();

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const mostrarSnackbar = (mensaje, tipo = "success") => {
    setSnackbarMessage(mensaje);
    setSnackbarSeverity(tipo);
    setSnackbarOpen(true);
  };

  const GetData = () => {
    AxiosInstance.get("user_data/").then((res) => {
      setMyData(res.data);
      setLoading(false);
    });
  };

  const GetEvents = () => {
    AxiosInstance.get("eventos/").then((res) => {
      setEvents(res.data);
    });
  };

  useEffect(() => {
    GetData();
    GetEvents();
  }, []);

  const handleRedirect = () => {
    navigate("/crear-evento");
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="contenedor-home">
          <div className="lista-eventos">
            <BarraBusqueda /> {/* 🔍 NUEVA BARRA AÑADIDA */}
            <h2 style={{ textAlign: "center" }}>Eventos:</h2>
            {Events.map((event) => (
              <EventoPostCard
                key={event.id}
                event={event}
                mostrarSnackbar={mostrarSnackbar}
              />
            ))}
          </div>
        </div>
      )}

      {/* Snackbar global para esta vista */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ position: "fixed", zIndex: 13000, bottom: 20, right: 20 }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Home;
