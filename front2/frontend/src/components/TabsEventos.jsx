import React from "react";
import "./TabsEventos.css";

const TabsEventos = ({ activeTab, onChangeTab }) => {
  return (
    <div className="tabs-eventos-contenedor">
      <div className="tabs-eventos-wrapper">
        <button
          className={`tab-btn ${activeTab === "para-ti" ? "active" : ""}`}
          onClick={() => onChangeTab("para-ti")}
        >
          Para ti
        </button>
        <button
          className={`tab-btn ${activeTab === "todos" ? "active" : ""}`}
          onClick={() => onChangeTab("todos")}
        >
          Todos
        </button>
        <button
          className={`tab-btn ${activeTab === "siguiendo" ? "active" : ""}`}
          onClick={() => onChangeTab("siguiendo")}
        >
          Siguiendo
        </button>
      </div>
    </div>
  );
};

export default TabsEventos;
