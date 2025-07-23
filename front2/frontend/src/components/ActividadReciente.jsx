import React from "react";
import ActividadFeed from "../components/ActividadFeed";
import TimelineIcon from "@mui/icons-material/Timeline";

const ActividadReciente = () => {
  return (
    <div
      style={{
        marginLeft: "240px",
        maxWidth: "860px",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <TimelineIcon color="primary" />
        <h2 style={{ margin: 0 }}>Actividad reciente</h2>
      </div>

      <ActividadFeed limite={50} />
    </div>
  );
};

export default ActividadReciente;
