import React from "react";
import { Link } from "react-router-dom";
import defaultAvatar from "../assets/default-avatar.jpg";
import BotonSeguir from "./Perfil/BotonSeguir"; // ✅ nuevo
import "./styles/Participantes.css";

const ListaInscritos = ({ inscritos }) => {
  const usuarioLogeado = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="seccion-participantes">
      <h4>USUARIOS INSCRITOS:</h4>
      <ul className="lista-participantes">
        {inscritos.length === 0 && <li>No hay participantes aún.</li>}

        {inscritos.map((user) => {
          const foto = user.profile_picture 
            ? user.profile_picture
            : defaultAvatar;

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

              {user.id !== usuarioLogeado?.id && (
                <div className="boton-participante">
                  <BotonSeguir targetUserId={user.id} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ListaInscritos;
