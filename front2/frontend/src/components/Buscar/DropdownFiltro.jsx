import React, { useState, useRef, useEffect } from "react";
import "./DropdownFiltro.css";

const DropdownFiltro = ({
  label,
  opciones,
  valorActual,
  onSeleccionar,
  multiple = false,
}) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, []);

  const handleSeleccion = (valor) => {
    if (!multiple) {
      onSeleccionar(valor);
      setAbierto(false);
    } else {
      const yaIncluido = valorActual.includes(valor);

      if (valor === "Todos") {
        onSeleccionar(["Todos"]);
      } else {
        const nuevaSeleccion = yaIncluido
          ? valorActual.filter((v) => v !== valor)
          : [...valorActual.filter((v) => v !== "Todos"), valor];

        onSeleccionar(nuevaSeleccion.length === 0 ? ["Todos"] : nuevaSeleccion);
      }
    }
  };

  const esActivo = (valor) => {
    return multiple ? valorActual.includes(valor) : valorActual === valor;
  };

  return (
    <div className="dropdown-filtro" ref={ref}>
      <button className="dropdown-trigger" onClick={() => setAbierto(!abierto)}>
        {label} ▾
      </button>

      {abierto && (
        <div className="dropdown-menu">
          {opciones.map((op) => (
            <div
              key={op.value}
              className={`dropdown-item ${esActivo(op.value) ? "activo" : ""}`}
              onClick={() => handleSeleccion(op.value)}
            >
              {multiple && (
                <input
                  type="checkbox"
                  checked={valorActual.includes(op.value)}
                  readOnly
                />
              )}
              <span>{op.label}</span>
            </div>
          ))}

          <div className="dropdown-footer">
            <button onClick={() => setAbierto(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownFiltro;
