import AxiosInstance from "./axiosInstance";
import { React, useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import EventoPostCard from "./EventoPostCard";
import BarraBusqueda from "./BarraBusqueda";
import TabsEventos from "./TabsEventos";
import "./Home.css";

const Home = () => {
  const [myData, setMyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("todos");
  const [animating, setAnimating] = useState(false);

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
      const eventosOrdenados = res.data.sort(
        (a, b) => new Date(b.event_date) - new Date(a.event_date)
      );
      setEvents(eventosOrdenados);
    });
  };

  useEffect(() => {
    GetData();
    GetEvents();
  }, []);

  const handleTabChange = (nuevaTab) => {
    if (nuevaTab === activeTab) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(nuevaTab);
      setAnimating(false);
    }, 300); // Coincide con la duración del CSS
  };

  const eventosFiltrados =
    activeTab === "para-ti" && myData?.interests?.length > 0
      ? events.filter((event) => {
          const categoriaEvento = event.category_name
            ? event.category_name.trim().toLowerCase()
            : "";
          const interesesUsuario = myData.interests.map((i) =>
            i.name.trim().toLowerCase()
          );
          return interesesUsuario.includes(categoriaEvento);
        })
      : events;

  const handleRedirect = () => {
    navigate("/crear-evento");
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="contenedor-home">
          <div className="zona-tabs">
            <TabsEventos activeTab={activeTab} onChangeTab={handleTabChange} />
          </div>

          <div className="zona-busqueda-wrapper">
            <div className="zona-busqueda-con-boton">
              <div className="barra-wrapper">
                <BarraBusqueda />
              </div>
              <button className="boton-crear-evento" onClick={handleRedirect}>
                + Crear evento
              </button>
            </div>
          </div>

          <div
            className={`bloque-eventos ${animating ? "fade-out" : "fade-in"}`}
          >
            {eventosFiltrados.length === 0 ? (
              <p style={{ textAlign: "center", marginTop: "1rem" }}>
                No se encontraron eventos.
              </p>
            ) : (
              eventosFiltrados.map((event) => (
                <EventoPostCard
                  key={event.id}
                  event={event}
                  mostrarSnackbar={mostrarSnackbar}
                />
              ))
            )}
          </div>
        </div>
      )}

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
