import React, { useEffect, useState } from "react";
import AxiosInstance from "./axiosInstance";
import "./styles/ActividadFeed.css";
import { Link } from "react-router-dom";

const ActividadFeed = () => {
  const [actividades, setActividades] = useState([]);

  useEffect(() => {
    const fetchActividades = async () => {
      try {
        const res = await AxiosInstance.get("/actividad_reciente/");
        setActividades(res.data);
      } catch (err) {
        console.error("Error al cargar actividad reciente:", err);
      }
    };

    fetchActividades();
  }, []);

  const renderTextoActividad = (tipo) => {
    switch (tipo) {
      case "creacion":
        return "creó el evento";
      case "inscripcion":
        return "se inscribió en";
      case "comentario":
        return "comentó en";
      default:
        return "realizó una actividad en";
    }
  };

  return (
    <div className="actividad-feed">
      {actividades.length === 0 ? (
        <p>No hay actividad reciente aún.</p>
      ) : (
        <ul className="actividad-lista">
          {actividades.map((act) => (
            <li key={act.id} className="actividad-item">
              <img
                src={
                  act.profile_picture?.startsWith("http")
                    ? act.profile_picture
                    : `http://localhost:8000${act.profile_picture}`
                }
                alt={act.full_name}
                className="actividad-avatar"
              />
              <div className="actividad-detalle">
                <p>
                  <strong>{act.full_name}</strong>{" "}
                  {renderTextoActividad(act.tipo)}{" "}
                  <Link to={`/ver-evento/${act.evento}`}>
                    {act.evento_title}
                  </Link>
                </p>
                <span className="actividad-fecha">
                  {new Date(act.fecha).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActividadFeed;
