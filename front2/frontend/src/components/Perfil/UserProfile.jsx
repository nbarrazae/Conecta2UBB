// src/components/Perfil/UserProfile.jsx
import React, { useEffect, useState } from "react";
import AxiosInstance from "../axiosInstance";
import CakeIcon from "@mui/icons-material/Cake";
import InfoIcon from "@mui/icons-material/Info";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const UserProfile = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await AxiosInstance.get("/users/ver_perfil/");
        setPerfil(res.data);
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  if (loading) return <p className="perfil-loading">Cargando perfil...</p>;
  if (!perfil)
    return <p className="perfil-error">No se pudo cargar el perfil.</p>;

  return (
    <div className="perfil-card">
      <div className="perfil-header">
        <img
          src={`http://localhost:8000${perfil.profile_picture}`}
          alt="Foto de perfil"
        />
        <div>
          <h2>{perfil.full_name}</h2>
          <p>@{perfil.username}</p>
        </div>
      </div>

      <div className="perfil-section">
        <div className="perfil-section-title">
          <CakeIcon />
          Cumpleaños
        </div>
        <p>{perfil.birthday}</p>
      </div>

      <div className="perfil-section">
        <div className="perfil-section-title">
          <InfoIcon />
          Sobre mí
        </div>
        <p>{perfil.bio}</p>
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
    </div>
  );
};

export default UserProfile;
