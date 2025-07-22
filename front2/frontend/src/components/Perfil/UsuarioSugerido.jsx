import React from "react";
import BotonSeguir from "./BotonSeguir";
import defaultAvatar from "../../assets/default-avatar.jpg";
import "./UsuarioSugerido.css";
import { Link } from "react-router-dom";

const UsuarioSugerido = ({ user, onSeguir }) => {
  const imagenPerfil = user.profile_picture
    ? user.profile_picture.startsWith("http")
      ? user.profile_picture
      : `http://localhost:8000${user.profile_picture}`
    : defaultAvatar;

  return (
    <div className="usuario-recomendado">
      <img
        src={imagenPerfil}
        alt="avatar"
        className="usuario-recomendado-avatar"
      />
      <div className="usuario-recomendado-info">
        <div className="usuario-recomendado-nombre">{user.full_name}</div>
        <Link
          to={`/perfil/${encodeURIComponent(user.username)}`}
          className="usuario-recomendado-username"
        >
          @{user.username}
        </Link>
      </div>
      <div className="usuario-recomendado-boton">
        <BotonSeguir
          targetUserId={user.id}
          onFollowSuccess={() => onSeguir(user.id)}
        />
      </div>
    </div>
  );
};

export default UsuarioSugerido;
