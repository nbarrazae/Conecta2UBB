import React, { useState, useEffect } from "react";
import "./BuscarEventos.css";
import ListaEventos from "./ListaEventos";
import ListaUsuarios from "./ListaUsuarios";
import AxiosInstance from "../axiosInstance";
import DropdownFiltro from "./DropdownFiltro";

// Iconos MUI
import EventIcon from "@mui/icons-material/Event";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";

const BuscarEventos = () => {
  const [filtroCategoria, setFiltroCategoria] = useState(["Todos"]);
  const [busqueda, setBusqueda] = useState("");
  const [rangoFecha, setRangoFecha] = useState("todos");
  const [orden, setOrden] = useState("-event_date");
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [tipoBusqueda, setTipoBusqueda] = useState("eventos");

  // 🔎 Búsqueda de usuarios
  useEffect(() => {
    const buscarUsuarios = async () => {
      if (tipoBusqueda !== "usuarios") {
        setUsuarios([]);
        return;
      }

      setLoadingUsuarios(true);
      try {
        const url = busqueda.trim()
          ? `/users/buscar/?search=${busqueda}`
          : `/users/buscar/`; // mostrar todos si no hay búsqueda

        const res = await AxiosInstance.get(url);
        setUsuarios(res.data);
      } catch (err) {
        console.error("Error al buscar usuarios:", err);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    buscarUsuarios();
  }, [busqueda, tipoBusqueda]);

  // 📁 Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await AxiosInstance.get("/categories/");
        const nombres = res.data.map((cat) => cat.name);
        setCategorias(["Todos", ...nombres]);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };

    fetchCategorias();
  }, []);

  // 🔢 Etiqueta con badge para Categoría
  const labelCategoria =
    filtroCategoria.length > 1 || filtroCategoria[0] !== "Todos" ? (
      <span className="filtro-con-badge">
        Categoría
        <span className="badge">{filtroCategoria.length}</span>
      </span>
    ) : (
      "Categoría"
    );

  const mapaFecha = {
    ultimos_7_dias: "Últimos 7 días",
    proximos_7_dias: "Próximos 7 días",
    proximo_mes: "Próximo mes",
  };

  return (
    <div className="buscar-wrapper">
      <div className="buscar-page">
        <div className="buscar-contenido">
          {/* 🔘 Selector tipo de búsqueda */}
          <div className="tipo-chip-selector">
            <div
              className={`tipo-chip ${
                tipoBusqueda === "eventos" ? "activo" : ""
              }`}
              onClick={() => setTipoBusqueda("eventos")}
            >
              <EventIcon fontSize="small" /> Eventos
            </div>
            <div
              className={`tipo-chip ${
                tipoBusqueda === "usuarios" ? "activo" : ""
              }`}
              onClick={() => setTipoBusqueda("usuarios")}
            >
              <PersonIcon fontSize="small" /> Usuarios
            </div>
          </div>

          {/* 🔍 Barra de búsqueda estilizada */}
          <div className="barra-busqueda-wrapper">
            <SearchIcon className="icono-busqueda" fontSize="small" />
            <input
              type="text"
              className="barra-busqueda"
              placeholder="Buscar"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* 🎛 Filtros (solo si se buscan eventos) */}
          {tipoBusqueda === "eventos" && (
            <div className="filtros-fecha-orden">
              <DropdownFiltro
                label={labelCategoria}
                valorActual={filtroCategoria}
                onSeleccionar={setFiltroCategoria}
                opciones={categorias.map((nombre) => ({
                  label: nombre,
                  value: nombre,
                }))}
                multiple
              />

              <DropdownFiltro
                label={
                  rangoFecha === "todos" ? (
                    "Fecha"
                  ) : (
                    <span className="filtro-activo-label">
                      {mapaFecha[rangoFecha] || "Fecha"}
                      <span
                        className="filtro-clear-x"
                        onClick={(e) => {
                          e.stopPropagation(); // evitar que se abra el dropdown
                          setRangoFecha("todos");
                        }}
                      >
                        ×
                      </span>
                    </span>
                  )
                }
                valorActual={rangoFecha}
                onSeleccionar={setRangoFecha}
                opciones={[
                  { label: "Todos", value: "todos" },
                  { label: "Últimos 7 días", value: "ultimos_7_dias" },
                  { label: "Próximos 7 días", value: "proximos_7_dias" },
                  { label: "Próximo mes", value: "proximo_mes" },
                ]}
              />

              <DropdownFiltro
                label={
                  orden === "-event_date"
                    ? "Más recientes"
                    : orden === "event_date"
                    ? "Más antiguos"
                    : "Ordenar por"
                }
                valorActual={orden}
                onSeleccionar={setOrden}
                opciones={[
                  { label: "Más recientes", value: "-event_date" },
                  { label: "Más antiguos", value: "event_date" },
                ]}
              />
            </div>
          )}

          {/* 📋 Resultados */}
          {tipoBusqueda === "eventos" ? (
            <ListaEventos
              categoria={filtroCategoria}
              textoBusqueda={busqueda}
              rangoFecha={rangoFecha}
              orden={orden}
            />
          ) : (
            <ListaUsuarios usuarios={usuarios} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BuscarEventos;
