import React, { useState } from "react";
import Popover from "@mui/material/Popover";
import Avatar from "@mui/material/Avatar";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ActividadFeed from "./ActividadFeed";
import "./styles/BurbujaActividad.css";

const BurbujaActividad = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <div className="burbuja-actividad" onClick={handleClick}>
        <Avatar sx={{ bgcolor: "#1976d2", width: 50, height: 50 }}>
          <FavoriteIcon />
        </Avatar>
      </div>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 340,
            maxHeight: 400,
            p: 2,
            boxShadow: 4,
            borderRadius: "12px",
          },
        }}
      >
        <h4 style={{ margin: "0 0 1rem 0" }}>Actividad reciente</h4>

        <div
          style={{
            maxHeight: "250px", // altura máxima visible del feed
            overflowY: "auto",
            marginTop: "-10px", // sube el contenido un poco
            paddingRight: "4px", // espacio para el scroll
          }}
        >
          <ActividadFeed limite={5} modoCompacto={true} />
        </div>
      </Popover>
    </>
  );
};

export default BurbujaActividad;
