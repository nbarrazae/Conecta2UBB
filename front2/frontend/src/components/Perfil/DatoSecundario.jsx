import React from "react";
import "./DatoSecundario.css";

const DatoSecundario = ({ icono, texto }) => {
  return (
    <div className="dato-secundario-wrapper">
      <div className="dato-secundario-contenido">
        {icono}
        <span>{texto}</span>
      </div>
    </div>
  );
};

export default DatoSecundario;
