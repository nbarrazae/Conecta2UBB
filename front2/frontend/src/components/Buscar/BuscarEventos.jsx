import React, { useState, useEffect } from "react";
import "./BuscarEventos.css";
import FiltrosBuscar from "./FiltrosBuscar";
import ListaEventos from "./ListaEventos";
import ListaUsuarios from "./ListaUsuarios";
import AxiosInstance from "../axiosInstance";

const BuscarEventos = () => {
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [rangoFecha, setRangoFecha] = useState("todos");
  const [orden, setOrden] = useState("-event_date");
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  useEffect(() => {
    const buscarUsuarios = async () => {
      if (!busqueda.trim()) {
        setUsuarios([]);
        return;
      }

      setLoadingUsuarios(true);
      try {
        const res = await AxiosInstance.get(
          `/users/buscar/?search=${busqueda}`
        );
        setUsuarios(res.data);
      } catch (err) {
        console.error("Error al buscar usuarios:", err);
      } finally {
        setLoadingUsuarios(false);
      }
    };

    buscarUsuarios();
  }, [busqueda]);

  return (
    <div className="buscar-wrapper">
      <div className="buscar-page">
        <div className="buscar-contenido">
          <input
            type="text"
            className="barra-busqueda"
            placeholder="Buscar eventos o usuarios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <FiltrosBuscar onChangeFiltro={setFiltroCategoria} />

          <div className="filtros-fecha-orden">
            <label>
              Rango de fecha:
              <select
                value={rangoFecha}
                onChange={(e) => setRangoFecha(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="ultimos_7_dias">Últimos 7 días</option>
                <option value="proximos_7_dias">Próximos 7 días</option>
                <option value="proximo_mes">Próximo mes</option>
              </select>
            </label>

            <label>
              Ordenar por:{" "}
              <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                <option value="-event_date">Más recientes</option>
                <option value="event_date">Más antiguos</option>
              </select>
            </label>
          </div>

          <ListaEventos
            categoria={filtroCategoria}
            textoBusqueda={busqueda}
            rangoFecha={rangoFecha}
            orden={orden}
          />

          <ListaUsuarios usuarios={usuarios} />
        </div>
      </div>
    </div>
  );
};

export default BuscarEventos;
