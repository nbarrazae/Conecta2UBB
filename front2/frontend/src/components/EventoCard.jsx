import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import defaultAvatar from "../assets/default-avatar.jpg";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";

import BotonInscripcion from "./BotonInscripcion";
import "./EventoCard.css";

const iconMap = [
  { keyword: "videojuego", icon: <SportsEsportsIcon fontSize="inherit" /> },
  { keyword: "deporte", icon: <SportsSoccerIcon fontSize="inherit" /> },
  { keyword: "ocio", icon: <TheaterComedyIcon fontSize="inherit" /> },
  { keyword: "cultura", icon: <ImportContactsIcon fontSize="inherit" /> },
];

const iconoCategoria = (nombre) => {
  if (!nombre || typeof nombre !== "string")
    return <EventIcon fontSize="inherit" />;
  const nombreLower = nombre.toLowerCase();
  for (const { keyword, icon } of iconMap) {
    if (nombreLower.includes(keyword)) return icon;
  }
  return <EventIcon fontSize="inherit" />;
};

const EventoCard = ({
  id,
  title,
  category_name,
  category,
  author_username,
  author_profile_picture,
  location,
  event_date,
  participants,
  max_participants,
}) => {
  const navigate = useNavigate();
  const [yaInscrito, setYaInscrito] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.email) {
      setYaInscrito(
        participants?.some((p) => p.toLowerCase() === user.email.toLowerCase())
      );
    }
  }, [participants]);

  const foto =
    (author_profile_picture?.trim() &&
      (author_profile_picture.startsWith("http")
        ? author_profile_picture
        : `http://localhost:8000${author_profile_picture}`)) ||
    defaultAvatar;

  const nombreCategoria = category_name || category;
  const estaLleno = participants?.length >= max_participants;

  return (
    <div
      className="evento-card compacto aparecer"
      onClick={() => navigate(`/ver-evento/${id}`)}
      style={{ cursor: "pointer", position: "relative" }}
    >
      {/* 🎯 Botón de inscripción arriba a la derecha */}
      <div
        className="evento-inscribir-top"
        onClick={(e) => e.stopPropagation()}
      >
        <BotonInscripcion
          eventId={id}
          yaInscrito={yaInscrito}
          estaLleno={estaLleno}
          onCambio={() => window.location.reload()}
        />
      </div>

      <div className="evento-icono">{iconoCategoria(nombreCategoria)}</div>

      <div className="evento-detalles">
        <div className="evento-header-linea">
          <h3 className="evento-titulo" title={title}>
            {title}
          </h3>
          <Link
            to={`/perfil-publico/${encodeURIComponent(author_username)}`}
            className="evento-autor-link"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={foto} alt={author_username} className="evento-avatar" />
            <span>{author_username}</span>
          </Link>
        </div>

        <div className="evento-info-item">
          <LocationOnIcon fontSize="small" />
          <span title={location}>{location}</span>
        </div>

        <div className="evento-linea-inferior">
          <div className="evento-info-item">
            <EventIcon fontSize="small" />
            <span>{event_date?.split("T")[0]}</span>
          </div>
          <div className="evento-info-item">
            <GroupIcon fontSize="small" />
            <span className={estaLleno ? "evento-lleno" : ""}>
              {participants?.length || 0}/{max_participants}
            </span>
          </div>
          {nombreCategoria && (
            <span className="chip-globo categoria-globo">
              {nombreCategoria}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventoCard;
