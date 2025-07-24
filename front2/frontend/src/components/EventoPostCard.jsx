import React, { useState, useEffect } from "react";
import EventoCard from "./EventoCard";
import defaultAvatar from "../assets/default-avatar.jpg";
import "./EventoPostCard.css";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AxiosInstance from "./axiosInstance";
import { Link } from "react-router-dom";
import BotonInscripcion from "./BotonInscripcion";

const EventoPostCard = ({ event, mostrarSnackbar }) => {
  const {
    id,
    title,
    category_name,
    category,
    author_username,
    author_profile_picture,
    location,
    event_date,
    max_participants,
    description,
    image,
  } = event;

  const [nuevoComentario, setNuevoComentario] = useState("");
  const [usuarioLogeado, setUsuarioLogeado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);

  // NUEVO: estados reactivos para inscripción
  const [listaParticipantes, setListaParticipantes] = useState(
    event.participants || []
  );
  const [yaInscrito, setYaInscrito] = useState(false);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await AxiosInstance.get("/users/ver_perfil/");
        setUsuarioLogeado(res.data);

        const email = res.data.email?.toLowerCase();
        if (email) {
          setYaInscrito(
            listaParticipantes.some((p) => p.toLowerCase() === email)
          );
        }
      } catch (error) {
        console.error("Error al obtener perfil de usuario:", error);
        setUsuarioLogeado(null);
      }
    };
    fetchPerfil();
  }, [listaParticipantes]);

  useEffect(() => {
    const fetchComentarios = async () => {
      setCargandoComentarios(true);
      try {
        const res = await AxiosInstance.get(`/comments/?evento=${id}&page=1`);
        setComentarios(res.data.results);
      } catch (error) {
        console.error("Error al cargar comentarios:", error);
      } finally {
        setCargandoComentarios(false);
      }
    };
    fetchComentarios();
  }, [id]);

  const manejarEnvioComentario = async () => {
    if (!nuevoComentario.trim()) return;
    try {
      await AxiosInstance.post("/comments/", {
        evento: id,
        content: nuevoComentario,
      });
      setNuevoComentario("");
      const res = await AxiosInstance.get(`/comments/?evento=${id}&page=1`);
      setComentarios(res.data.results);
    } catch (error) {
      console.error("Error al enviar comentario:", error);
    }
  };

  const handleCambioInscripcion = (accion) => {
    const email = usuarioLogeado?.email?.toLowerCase();
    if (!email) return;

    if (accion === "inscrito") {
      setListaParticipantes((prev) => [...prev, email]);
      setYaInscrito(true);
    } else if (accion === "desinscrito") {
      setListaParticipantes((prev) =>
        prev.filter((p) => p.toLowerCase() !== email)
      );
      setYaInscrito(false);
    }
  };

  return (
    <div className="evento-post-card">
      <EventoCard
        id={id}
        title={title}
        category_name={category_name}
        category={category}
        author_username={author_username}
        author_profile_picture={author_profile_picture}
        location={location}
        event_date={event_date}
        participants={listaParticipantes}
        max_participants={max_participants}
        sinSombra={true}
        mostrarSnackbar={mostrarSnackbar}
        yaInscrito={yaInscrito}
        onCambio={handleCambioInscripcion}
        estaLleno={listaParticipantes.length >= max_participants}
      />

      <div className="evento-post-separador" />

      {/* <div className="evento-post-body">
        {description && <p className="evento-descripcion">{description}</p>}
        {image && (
          <img
            src={
              image.startsWith("http") ? image : `http://localhost:8000${image}`
            }
            alt="Imagen del evento"
            className="evento-imagen"
          />
        )}
      </div> */}

      <div className="evento-post-footer">
        <div className="evento-comentarios-header">
          <div className="evento-comentarios-resumen">
            <ChatBubbleOutlineIcon
              fontSize="small"
              style={{ marginRight: "6px" }}
            />
            {comentarios.length} comentario{comentarios.length !== 1 && "s"}
          </div>
        </div>

        <div className="evento-comentario-nuevo">
          <img
            src={
              usuarioLogeado?.profile_picture
                ? usuarioLogeado.profile_picture
                : defaultAvatar
            }
            alt="Usuario"
            className="comentario-avatar"
          />
          <input
            type="text"
            placeholder="Escribe un comentario..."
            className="comentario-input"
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
          />
          <button onClick={manejarEnvioComentario} className="comentario-boton">
            Enviar
          </button>
        </div>

        {comentarios.length > 0 && (
          <div className="evento-comentarios-lista">
            {comentarios.slice(0, 2).map((comentario) => (
              <div key={comentario.id} className="comentario-item">
                <img
                  src={
                    comentario.author_profile_picture
                      ? comentario.author_profile_picture
                      : defaultAvatar
                  }
                  alt="Avatar"
                  className="comentario-avatar"
                />
                <div className="comentario-contenido">
                  <div className="comentario-header">
                    <Link
                      to={`/perfil-publico/${comentario.author_username}`}
                      className="comentario-autor-link"
                    >
                      <span className="comentario-autor">
                        {comentario.author_username}
                      </span>
                    </Link>
                    <span className="comentario-fecha">
                      {new Date(comentario.created_at).toLocaleString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="comentario-texto">{comentario.content}</p>
                </div>
              </div>
            ))}

            {comentarios.length > 2 && (
              <div className="ver-todos-comentarios">
                <Link
                  to={`/ver-evento/${id}?comentario=scroll`}
                  className="ver-todos-link"
                >
                  Ver todos los comentarios...
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventoPostCard;
