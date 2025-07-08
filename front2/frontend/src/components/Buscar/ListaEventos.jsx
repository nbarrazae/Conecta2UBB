import React, { useEffect, useState } from "react";
import AxiosInstance from "../axiosInstance";
import dayjs from "dayjs";
import "./ListaEventos.css";
import defaultAvatar from "../../assets/default-avatar.jpg";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import { Link } from "react-router-dom";
import defaultAvatar from "../../assets/default-avatar.jpg";

const iconMap = [
  { keyword: "videojuego", icon: <SportsEsportsIcon /> },
  { keyword: "deporte", icon: <SportsSoccerIcon /> },
  { keyword: "ocio", icon: <TheaterComedyIcon /> },
  { keyword: "cultura", icon: <ImportContactsIcon /> },

  // Agrega aquí más si quieres
];

const iconMap = [
  { keyword: "videojuego", icon: <SportsEsportsIcon /> },
  { keyword: "deporte", icon: <SportsSoccerIcon /> },
  { keyword: "ocio", icon: <TheaterComedyIcon /> },
  { keyword: "cultura", icon: <ImportContactsIcon /> },

  // Agrega aquí más si quieres
];

const iconoCategoria = (nombre) => {
  if (!nombre || typeof nombre !== "string") return <EventIcon />;

  const nombreLower = nombre.toLowerCase();

  for (const { keyword, icon } of iconMap) {
    if (nombreLower.includes(keyword)) return icon;
  }

  return <EventIcon />;
};

const ListaEventos = ({ categoria, textoBusqueda, rangoFecha, orden }) => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      setLoading(true);
      try {
        const params = {};

        if (textoBusqueda.trim()) {
          params.palabra_clave = textoBusqueda.trim();
        }

        if (categoria && categoria !== "Todos") {
          params.categoria = categoria;
        }

        // Fecha actual
        const hoy = dayjs();

        // Rango de fechas usando parámetros correctos
        if (rangoFecha === "ultimos_7_dias") {
          params["fecha__gte"] = hoy.subtract(7, "day").format("YYYY-MM-DD");
          params["fecha__lte"] = hoy.format("YYYY-MM-DD");
        } else if (rangoFecha === "proximos_7_dias") {
          params["fecha__gte"] = hoy.format("YYYY-MM-DD");
          params["fecha__lte"] = hoy.add(7, "day").format("YYYY-MM-DD");
        } else if (rangoFecha === "proximo_mes") {
          const primerDiaProximoMes = dayjs().add(1, "month").startOf("month");
          const ultimoDiaProximoMes = dayjs().add(1, "month").endOf("month");

          params["fecha__gte"] = primerDiaProximoMes.format("YYYY-MM-DD");
          params["fecha__lte"] = ultimoDiaProximoMes.format("YYYY-MM-DD");
        }

        if (orden) {
          params.ordering = orden;
        }

        const res = await AxiosInstance.get("/eventos/", { params });
        setEventos(res.data);
      } catch (error) {
        console.error("Error al obtener eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [categoria, textoBusqueda, rangoFecha, orden]);

  if (loading) return <p>Cargando eventos...</p>;
  if (eventos.length === 0) return <p>No se encontraron eventos.</p>;

  return (
    <div className="lista-eventos">
      {eventos.map((e) => (
        <div key={e.id} className="evento-card compacto">
          <div className="evento-icono">{iconoCategoria(e.category_name)}</div>

          <div className="evento-detalles">
            <div className="evento-titulo-línea">
              <h3 className="evento-titulo">{e.title}</h3>
              <span className="chip-globo">{e.category_name}</span>
            </div>

            <div className="evento-info-grid">
              <Link
                to={`/perfil-publico/${encodeURIComponent(e.author_username)}`}
                className="evento-autor-link"
              >
                <img
                  src={
                    e.author_profile_picture &&
                    e.author_profile_picture.trim() !== ""
                      ? e.author_profile_picture
                      : defaultAvatar
                  }
                  alt={e.author_username}
                  className="evento-avatar"
                />

                <span>{e.author_username}</span>
              </Link>

              <div className="evento-datos">
                <div className="evento-info-item">
                  <LocationOnIcon fontSize="small" />
                  <span>{e.location}</span>
                </div>
                <div className="evento-info-item">
                  <EventIcon fontSize="small" />
                  <span>{e.event_date?.split("T")[0]}</span>
                </div>
                <div className="evento-info-item">
                  <GroupIcon fontSize="small" />
                  <span>{e.participants.length} asistentes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaEventos;
