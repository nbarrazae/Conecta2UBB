import React from "react";
import "./EventosUsuario.css";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GroupIcon from "@mui/icons-material/Group";

const iconosCategoria = {
  Deportes: <SportsSoccerIcon />,
  Videojuegos: <SportsEsportsIcon />,
  Default: <EventIcon />,
};

const EventosUsuario = ({ eventos }) => {
  if (!eventos || eventos.length === 0) return null;

  return (
    <div className="eventos-section">
      <h2 className="eventos-title">Mis eventos</h2>
      <div className="eventos-list">
        {eventos.map((evento) => (
          <div className="evento-card" key={evento.id}>
            <div className="evento-icon">
              {iconosCategoria[evento.category] || iconosCategoria.Default}
            </div>
            <div className="evento-info">
              <h3 className="evento-nombre">{evento.title}</h3>

              <div className="evento-meta-line">
                <LocationOnIcon className="evento-icon-info" />
                <span>{evento.location}</span>
              </div>

              <div className="evento-meta-line">
                <CalendarTodayIcon className="evento-icon-info" />
                <span>{new Date(evento.event_date).toLocaleDateString()}</span>
              </div>

              <div className="evento-meta-line">
                <GroupIcon className="evento-icon-info" />
                <span>{evento.participants?.length || 0} asistentes</span>
              </div>

              <div className="evento-etiquetas">
                <span className="etiqueta">{evento.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventosUsuario;
