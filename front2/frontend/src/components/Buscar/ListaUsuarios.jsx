import React from "react";
import "./ListaUsuarios.css";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/default-avatar.jpg";

const ListaUsuarios = ({ usuarios }) => {
  const navigate = useNavigate();

  if (usuarios.length === 0) return null;

  return (
    <div className="lista-usuarios">
      <div className="usuarios-grid">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="usuario-card aparecer"
            onClick={() => navigate(`/perfil-publico/${u.username}`)}
          >
            <img
              src={
                u.profile_picture
                  ? `http://localhost:8000${u.profile_picture}`
                  : defaultAvatar
              }
              alt="Foto de perfil"
              className="usuario-avatar"
              onError={(e) => (e.target.src = defaultAvatar)}
            />

            <div className="usuario-info">
              <h4>{u.full_name}</h4>
              <p>@{u.username}</p>
              <p className="bio">{u.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListaUsuarios;
