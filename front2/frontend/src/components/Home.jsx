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
      console.log("Usuario logeado (completo):", res.data);
      setMyData(res.data);
      setLoading(false);
    });
  };

  const GetEvents = () => {
    AxiosInstance.get("eventos/").then((res) => {
      console.log("Eventos recibidos:", res.data);
      const eventosOrdenados = res.data.sort((a, b) =>
        a.event_date > b.event_date ? 1 : -1
      );
      setEvents(eventosOrdenados);
    });
  };

  useEffect(() => {
    GetData();
    GetEvents();
  }, []);

  // Filtro de eventos según pestaña activa
  const eventosFiltrados =
    activeTab === "para-ti" && myData?.interests && myData.interests.length > 0
      ? events.filter((event) => {
          const categoriaEvento = event.category_name
            ? event.category_name.trim().toLowerCase()
            : "";
          const interesesUsuario = myData.interests.map((i) =>
            i.name.trim().toLowerCase()
          );
          const incluido = interesesUsuario.includes(categoriaEvento);
          console.log(
            `[DEBUG] Evento: ${event.title} | Categoría: "${categoriaEvento}" | Intereses: ${interesesUsuario} | ¿Incluido?: ${incluido}`
          );
          return incluido;
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
            <TabsEventos activeTab={activeTab} onChangeTab={setActiveTab} />
          </div>

          {/* 🔹 La barra de búsqueda debe estar centrada */}
          <div className="zona-busqueda">
            <BarraBusqueda />
          </div>

          {/* 🔹 Solo movemos el bloque de eventos */}
          <div className="bloque-eventos">
            <h2 className="titulo-eventos">
              {activeTab === "para-ti"
                ? "Eventos para ti:"
                : "Todos los eventos:"}
            </h2>

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
