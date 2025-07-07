import React, { useEffect, useState } from "react";
import AxiosInstance from "../axiosInstance";
import "./FiltrosBuscar.css";

const FiltrosBuscar = ({ onChangeFiltro }) => {
  const [categorias, setCategorias] = useState([]);
  const [activo, setActivo] = useState("Todos");

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

  const handleClick = (categoria) => {
    setActivo(categoria);
    onChangeFiltro?.(categoria);
  };

  return (
    <div className="filtros-buscar">
      {categorias.map((cat) => (
        <button
          key={cat}
          className={`chip-filtro ${activo === cat ? "activo" : ""}`}
          onClick={() => handleClick(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default FiltrosBuscar;
