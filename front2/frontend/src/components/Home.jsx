import AxiosInstance from "./axiosInstance";
import { React, useEffect, useState } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import EventoPostCard from "./EventoPostCard";
import BarraBusqueda from "./BarraBusqueda";
import TabsEventos from "./TabsEventos";
import "./Home.css";
import UsuarioSugerido from "../components/Perfil/UsuarioSugerido";

const Home = () => {
  const [myData, setMyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("todos");
  const [animating, setAnimating] = useState(false);
  const [usuariosSugeridos, setUsuariosSugeridos] = useState([]);

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

  const GetEvents = (tab = "todos") => {
    let url = "eventos/";

    if (tab === "siguiendo") {
      url += "?siguiendo=true";
    }

    AxiosInstance.get(url).then((res) => {
      const eventosOrdenados = res.data.sort(
        (a, b) => new Date(b.event_date) - new Date(a.event_date)
      );
      setEvents(eventosOrdenados);
    });
  };

  useEffect(() => {
    GetData();
    GetEvents(activeTab);
  }, []);

  const handleTabChange = (nuevaTab) => {
    if (nuevaTab === activeTab) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveTab(nuevaTab);
      GetEvents(nuevaTab);
      if (nuevaTab === "siguiendo") {
        cargarUsuariosSugeridos();
      }
      setAnimating(false);
    }, 300);
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

  const cargarUsuariosSugeridos = async () => {
    try {
      const res = await AxiosInstance.get("/users/buscar/");
      const usuarios = res.data.filter(
        (u) => u.id !== myData?.id && !myData?.following_ids?.includes(u.id)
      );
      setUsuariosSugeridos(usuarios.slice(0, 5));
    } catch (err) {
      console.error("Error al cargar usuarios sugeridos:", err);
    }
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
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                {activeTab === "siguiendo" ? (
                  <>
                    <p>
                      Aún no sigues a ningún usuario o las personas que sigues
                      no han creado eventos.
                    </p>

                    {usuariosSugeridos.length > 0 && (
                      <div
                        style={{
                          marginTop: "1.5rem",
                          textAlign: "left",
                          maxWidth: "600px",
                          marginInline: "auto",
                        }}
                      >
                        <h4
                          style={{
                            marginBottom: "0.75rem",
                            fontSize: "0.95rem",
                            color: "#333",
                            fontWeight: 600,
                          }}
                        >
                          USUARIOS RECOMENDADOS:
                        </h4>
                        {usuariosSugeridos.map((user) => (
                          <UsuarioSugerido key={user.id} user={user} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p>No se encontraron eventos.</p>
                )}
              </div>
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
