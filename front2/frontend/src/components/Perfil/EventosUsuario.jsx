import React from "react";
import "./EventosUsuario.css";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";
import { useNavigate } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip"; // ✅ IMPORTACIÓN NUEVA

const iconosCategoria = {
  Deportes: <SportsSoccerIcon />,
  Videojuegos: <SportsEsportsIcon />,
  Default: <EventIcon />,
};

const EventosUsuario = ({ eventos }) => {
  const navigate = useNavigate();

  if (!eventos || eventos.length === 0) return null;

  return (
    <div className="eventos-section">
      <h2 className="eventos-title">Mis eventos</h2>
      <div className="eventos-list">
        {eventos.map((evento) => {
          const participantes = evento.participants?.length || 0;
          const estaLleno = participantes >= evento.max_participants;

          const contenidoAsistentes = (
            <div
              className="evento-item-horizontal"
              style={{ color: estaLleno ? "#d32f2f" : "inherit" }}
            >
              <GroupIcon fontSize="small" />
              <span>
                {participantes}/{evento.max_participants}
              </span>
            </div>
          );

          return (
            <div
              className="evento-card-horizontal"
              key={evento.id}
              onClick={() => navigate(`/ver-evento/${evento.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="evento-icon-horizontal">
                {iconosCategoria[evento.category] || iconosCategoria.Default}
              </div>

              <div className="evento-contenido-horizontal">
                <div className="evento-header-horizontal">
                  <h3 className="evento-nombre-horizontal">{evento.title}</h3>
                  <span className="chip-globo-horizontal">
                    {evento.category}
                  </span>
                </div>

                <div className="evento-info-horizontal">
                  <div className="evento-item-horizontal">
                    <LocationOnIcon fontSize="small" />
                    <span>{evento.location}</span>
                  </div>
                  <div className="evento-item-horizontal">
                    <CalendarTodayIcon fontSize="small" />
                    <span>
                      {new Date(evento.event_date).toLocaleDateString()}
                    </span>
                  </div>

                  {estaLleno ? (
                    <Tooltip title="Evento lleno" arrow>
                      {contenidoAsistentes}
                    </Tooltip>
                  ) : (
                    contenidoAsistentes
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventosUsuario;
