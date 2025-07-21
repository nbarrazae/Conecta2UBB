import React from "react";
import { Link } from "react-router-dom";
import defaultAvatar from "../assets/default-avatar.jpg";
import "./styles/Participantes.css";

const ListaInscritos = ({ inscritos }) => {
  console.log("Inscritos recibidos:", inscritos);
  return (
    <div className="seccion-participantes">
      <h4>USUARIOS INSCRITOS:</h4>
      <ul className="lista-participantes">
        {inscritos.length === 0 && <li>No hay participantes aún.</li>}
        {inscritos.map((user) => {
          const foto = user.profile_picture?.startsWith("http")
            ? user.profile_picture
            : `http://localhost:8000${user.profile_picture || ""}`;

          return (
            <li key={user.id} className="participante-item">
              <img
                src={foto || defaultAvatar}
                alt="avatar"
                className="avatar-participante"
              />
              <div className="participante-datos">
                <span className="participante-nombre">
                  {user.full_name?.trim() || "Sin nombre"}
                </span>

                <Link
                  to={`/perfil-publico/${encodeURIComponent(user.username)}`}
                  className="participante-username"
                >
                  @{user.username}
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ListaInscritos;
