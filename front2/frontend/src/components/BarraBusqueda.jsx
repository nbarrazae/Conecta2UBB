import React, { useState, useEffect, useRef } from "react";
import SearchIcon from "@mui/icons-material/Search";
import AxiosInstance from "./axiosInstance";
import "./BarraBusqueda.css";
import { useNavigate } from "react-router-dom";
import defaultAvatar from "../assets/default-avatar.jpg";
import { getCategoryIcon } from "../utils/categoryIcons";

const BarraBusqueda = () => {
  const [input, setInput] = useState("");
  const [eventos, setEventos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [visible, setVisible] = useState(false);
  const [historial, setHistorial] = useState([]);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const HISTORIAL_KEY = "historial_busqueda";

  // Cargar historial al inicio
  useEffect(() => {
    const guardado = localStorage.getItem(HISTORIAL_KEY);
    if (guardado) setHistorial(JSON.parse(guardado));
  }, []);

  const guardarEnHistorial = (item) => {
    const serializableItem = {
      tipo: item.tipo,
      id: item.id,
      nombre: item.nombre,
      username: item.username || null,
      category_name: item.category_name || null, // solo para eventos
      foto: item.foto || null, // solo para usuarios
    };

    const nuevoHistorial = [
      serializableItem,
      ...historial.filter((h) => {
        if (serializableItem.tipo === "evento")
          return h.tipo !== "evento" || h.id !== serializableItem.id;
        return h.tipo !== "usuario" || h.username !== serializableItem.username;
      }),
    ].slice(0, 10);

    setHistorial(nuevoHistorial);
    localStorage.setItem(HISTORIAL_KEY, JSON.stringify(nuevoHistorial));
  };

  const borrarHistorial = () => {
    setHistorial([]);
    localStorage.removeItem(HISTORIAL_KEY);
  };

  const fetchSugerencias = async () => {
    try {
      const resEventos = await AxiosInstance.get("/eventos/", {
        params: { search: input },
      });

      const resUsuarios = await AxiosInstance.get("/users/buscar/", {
        params: { search: input },
      });

      const filtro = input.trim().toLowerCase();

      const eventosFiltrados = resEventos.data
        .filter((e) => e.title?.toLowerCase().includes(filtro))
        .map((e) => ({
          tipo: "evento",
          id: e.id,
          nombre: e.title,
          icono: getCategoryIcon(e.category_name),
        }));

      const usuariosFiltrados = resUsuarios.data
        .filter(
          (u) =>
            u.username?.toLowerCase().includes(filtro) ||
            u.full_name?.toLowerCase().includes(filtro)
        )
        .map((u) => ({
          tipo: "usuario",
          id: u.id,
          nombre: u.full_name || u.username,
          username: u.username,
          foto: u.profile_picture
            ? u.profile_picture
            : defaultAvatar 
        }));

      setEventos(eventosFiltrados);
      setUsuarios(usuariosFiltrados);
    } catch (err) {
      console.error("Error buscando sugerencias:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchSugerencias(), 300);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickSugerencia = (s) => {
    guardarEnHistorial(s);
    setVisible(false);
    setInput("");

    if (s.tipo === "evento") {
      navigate(`/ver-evento/${s.id}`);
    } else if (s.tipo === "usuario") {
      navigate(`/perfil-publico/${s.username}`);
    }
  };

  return (
    <div className="barra-busqueda-dropdown" ref={wrapperRef}>
      <div className="barra-busqueda-wrapper" onClick={() => setVisible(true)}>
        <SearchIcon className="icono-busqueda" fontSize="small" />
        <input
          type="text"
          className="barra-busqueda"
          placeholder="Buscar"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => {
            setVisible(true);
            fetchSugerencias();
          }}
        />
      </div>

      {visible && (
        <div className="sugerencias-dropdown">
          {input.trim() === "" && historial.length > 0 ? (
            <>
              <div className="sugerencia-titulo">
                Recientes{" "}
                <span
                  onClick={borrarHistorial}
                  style={{
                    float: "right",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    color: "red",
                  }}
                >
                  Borrar todo
                </span>
              </div>
              {historial.map((h, i) => (
                <div
                  key={`hist-${i}`}
                  className="sugerencia-item"
                  onClick={() => handleClickSugerencia(h)}
                >
                  <div className="sugerencia-icono">
                    {h.tipo === "evento" ? (
                      getCategoryIcon(h.category_name)
                    ) : (
                      <img
                        src={h.foto}
                        alt="avatar"
                        className="imagen-usuario"
                      />
                    )}
                  </div>
                  <div className="sugerencia-texto">
                    <strong>{h.nombre}</strong>
                    {h.tipo === "usuario" && (
                      <span className="username">@{h.username}</span>
                    )}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {eventos.length > 0 && (
                <>
                  <div className="sugerencia-titulo">Eventos</div>
                  {eventos.map((s, i) => (
                    <div
                      key={`evento-${i}`}
                      className="sugerencia-item"
                      onClick={() => handleClickSugerencia(s)}
                    >
                      <div className="sugerencia-icono">{s.icono}</div>
                      <div className="sugerencia-texto">
                        <strong>{s.nombre}</strong>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {usuarios.length > 0 && (
                <>
                  <div className="sugerencia-separador" />
                  <div className="sugerencia-titulo">Usuarios</div>
                  {usuarios.map((s, i) => (
                    <div
                      key={`usuario-${i}`}
                      className="sugerencia-item"
                      onClick={() => handleClickSugerencia(s)}
                    >
                      <div className="sugerencia-icono">
                        <img
                          src={s.foto}
                          alt="avatar"
                          className="imagen-usuario"
                        />
                      </div>
                      <div className="sugerencia-texto">
                        <strong>{s.nombre}</strong>
                        <span className="username">@{s.username}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BarraBusqueda;
