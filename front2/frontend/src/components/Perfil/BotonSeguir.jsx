import React, { useEffect, useState } from "react";
import AxiosInstance from "../axiosInstance";
import "./BotonSeguir.css";

const BotonSeguir = ({ targetUserId }) => {
  const [siguiendo, setSiguiendo] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AxiosInstance.get(`/esta_siguiendo/${targetUserId}/`)
      .then((res) => setSiguiendo(res.data.esta_siguiendo))
      .catch((err) => console.error("Error verificando seguimiento:", err));
  }, [targetUserId]);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (siguiendo) {
        await AxiosInstance.post(`/dejar_de_seguir/${targetUserId}/`);
        setSiguiendo(false);
      } else {
        await AxiosInstance.post(`/seguir/${targetUserId}/`);
        setSiguiendo(true);
      }
    } catch (err) {
      console.error("Error al cambiar seguimiento:", err);
    } finally {
      setLoading(false);
    }
  };

  if (siguiendo === null) return null;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`boton-seguir ${siguiendo ? "siguiendo" : "no-siguiendo"} ${
        hovered && siguiendo ? "hover-danger" : ""
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {loading
        ? "..."
        : siguiendo
        ? hovered
          ? "Dejar de seguir"
          : "Siguiendo"
        : "Seguir"}
    </button>
  );
};

export default BotonSeguir;
