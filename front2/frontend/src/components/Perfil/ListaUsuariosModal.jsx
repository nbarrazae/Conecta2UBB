import React, { useEffect, useState } from "react";
import AxiosInstance from "../axiosInstance";
import defaultAvatar from "../../assets/default-avatar.jpg";
import "./ListaUsuariosModal.css";
import BotonSeguir from "./BotonSeguir";
import { useNavigate } from "react-router-dom";

const ListaUsuariosModal = ({ userId, tipo, onClose }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioLogeado, setUsuarioLogeado] = useState(null);
  const navigate = useNavigate();

  const cargarUsuarios = () => {
    const endpoint =
      tipo === "seguidores" ? `/seguidores/${userId}/` : `/seguidos/${userId}/`;
    AxiosInstance.get(endpoint)
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error("Error cargando usuarios:", err));
  };

  useEffect(() => {
    cargarUsuarios();
  }, [userId, tipo]);

  useEffect(() => {
    AxiosInstance.get("/users/ver_perfil/")
      .then((res) => setUsuarioLogeado(res.data))
      .catch((err) => console.error("Error obteniendo usuario logeado:", err));
  }, []);

  const handleUserClick = (username) => {
    onClose(); // Cierra el modal
    setTimeout(() => {
      navigate(`/perfil-publico/${username}`);
    }, 100);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <h3>{tipo === "seguidores" ? "Seguidores" : "Siguiendo"}</h3>
        <ul className="lista-usuarios">
          {usuarios.map((u) => (
            <li key={u.id} className="usuario-item">
              <div
                className="usuario-link"
                onClick={() => handleUserClick(u.username)}
              >
                <img
                  src={
                    u.profile_picture
                      ? u.profile_picture
                      : defaultAvatar
                  }
                  alt="avatar"
                />
                <div className="usuario-info">
                  <div className="usuario-nombre">
                    {u.full_name || "Sin nombre"}
                  </div>
                  <div className="usuario-username">@{u.username}</div>
                </div>
              </div>

              {usuarioLogeado?.id !== u.id && (
                <div className="usuario-boton">
                  <BotonSeguir
                    targetUserId={u.id}
                    onFollowChange={cargarUsuarios}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ListaUsuariosModal;
