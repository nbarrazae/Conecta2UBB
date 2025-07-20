import React, { useState } from "react";
import EventoCard from "../EventoCard";
import "./EventosUsuario.css";

const EventosUsuario = ({ eventos, username, email }) => {
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);

  if (!eventos || eventos.length === 0) return null;

  const toggleRol = (rol) => {
    setRolesSeleccionados((prev) =>
      prev.includes(rol) ? prev.filter((r) => r !== rol) : [...prev, rol]
    );
  };

  const filtrarEventos = () => {
    if (rolesSeleccionados.length === 0) return eventos;

    return eventos.filter((e) => {
      const esOrganizador = e.author_username === username;
      const esAsistente = e.participants?.includes(email);

      const quiereOrg = rolesSeleccionados.includes("organizador");
      const quiereAsis = rolesSeleccionados.includes("asistente");

      if (quiereOrg && quiereAsis) return esOrganizador && esAsistente;
      if (quiereOrg) return esOrganizador;
      if (quiereAsis) return esAsistente;

      return false; // fallback defensivo
    });
  };

  const eventosFiltrados = filtrarEventos();

  return (
    <div>
      <div className="eventos-usuario-header">
        <span className="rol-label">MOSTRAR EVENTOS COMO:</span>
        {["organizador", "asistente"].map((rol) => (
          <span
            key={rol}
            className={`chip-rol ${
              rolesSeleccionados.includes(rol) ? `activo ${rol}` : ""
            }`}
            onClick={() => toggleRol(rol)}
          >
            {rol.charAt(0).toUpperCase() + rol.slice(1)}
          </span>
        ))}
      </div>

      <div className="lista-eventos">
        {eventosFiltrados.map((e) => {
          const esOrganizador = e.author_username === username;
          const esAsistente = e.participants?.includes(email);

          return (
            <EventoCard
              key={e.id}
              id={e.id}
              title={e.title}
              category={e.category}
              category_name={e.category_name}
              author_username={e.author_username}
              author_profile_picture={e.author_profile_picture}
              location={e.location}
              event_date={e.event_date}
              participants={e.participants}
              max_participants={e.max_participants}
              esOrganizador={esOrganizador}
              esAsistente={esAsistente}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EventosUsuario;
