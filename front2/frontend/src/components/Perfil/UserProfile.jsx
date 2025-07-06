import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AxiosInstance from "../axiosInstance";
import CakeIcon from "@mui/icons-material/Cake";
import InfoIcon from "@mui/icons-material/Info";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventosUsuario from "./EventosUsuario";
import EditarPerfil from "./EditarPerfil";
import defaultAvatar from "../../assets/default-avatar.jpg";
import "./Perfil.css";

const UserProfile = () => {
  const { username } = useParams(); // para rutas como /perfil-publico/:username
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const usuarioLogeado = JSON.parse(localStorage.getItem("user") || "{}");
  const usernameLogeado = usuarioLogeado?.username;

  const fetchPerfil = async () => {
    try {
      const res = username
        ? await AxiosInstance.get(`/users/username/${username}/`)
        : await AxiosInstance.get("/users/ver_perfil/");
      setPerfil(res.data);
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, [username]);

  const handleUpdate = () => {
    fetchPerfil();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const getFechaFormateada = () => {
    if (!perfil?.birthday) return "Sin fecha";

    try {
      const [d, m, y] = perfil.birthday.split("/");
      const fecha = new Date(Number(y), Number(m) - 1, Number(d));
      if (isNaN(fecha.getTime())) return "Fecha inválida";

      const opciones = { month: "long" };
      const mes = fecha.toLocaleString("es-CL", opciones);
      const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);

      return `${fecha.getDate()} de ${mesCapitalizado} de ${fecha.getFullYear()}`;
    } catch {
      return "Fecha inválida";
    }
  };

  const esPerfilPropio = perfil?.username === usernameLogeado;

  if (loading) return <p className="perfil-loading">Cargando perfil...</p>;
  if (!perfil)
    return <p className="perfil-error">No se pudo cargar el perfil.</p>;

  return (
    <>
      <div className="perfil-wrapper">
        <div className="perfil-page">
          <div className="perfil-label">
            {esPerfilPropio ? "Mi perfil" : "Perfil público"}
          </div>

          <div className="perfil-card">
            <div className="perfil-header">
              <img
                src={
                  perfil.profile_picture
                    ? `http://localhost:8000${perfil.profile_picture}`
                    : defaultAvatar
                }
                alt="Foto de perfil"
              />
              <div className="perfil-header-info">
                <div className="perfil-nombre-wrapper">
                  <h2
                    className="perfil-nombre-usuario"
                    title={perfil.full_name}
                  >
                    {perfil.full_name || "Sin nombre"}
                  </h2>
                  <p className="perfil-username">@{perfil.username}</p>
                  <p className="perfil-birthday">
                    <CakeIcon fontSize="small" style={{ marginRight: "4px" }} />
                    {getFechaFormateada()}
                  </p>
                </div>

                {esPerfilPropio && (
                  <button
                    className="editar-perfil-btn"
                    onClick={() => setShowModal(true)}
                  >
                    Editar perfil
                  </button>
                )}
              </div>
            </div>

            <div className="perfil-section">
              <div className="perfil-section-title">
                <InfoIcon />
                Sobre mí
              </div>
              <p className="perfil-bio">{perfil.bio || "Sin biografía"}</p>
            </div>

            <div className="perfil-section">
              <div className="perfil-section-title">
                <LocalOfferIcon />
                Intereses
              </div>
              <div className="perfil-interests">
                {perfil.interests?.length > 0 ? (
                  perfil.interests.map((cat) => (
                    <span className="perfil-interest" key={cat.id}>
                      {cat.name}
                    </span>
                  ))
                ) : (
                  <span className="perfil-interest">Sin intereses</span>
                )}
              </div>
            </div>

            <EventosUsuario eventos={perfil.eventos_participados} />

            {esPerfilPropio && showModal && (
              <EditarPerfil
                perfil={perfil}
                onClose={() => setShowModal(false)}
                onUpdate={handleUpdate}
              />
            )}
          </div>
        </div>
      </div>

      {esPerfilPropio && showToast && (
        <div className="toast-confirmacion">
          <CheckCircleIcon style={{ marginRight: "8px" }} />
          Cambios aplicados con éxito
        </div>
      )}
    </>
  );
};

export default UserProfile;
