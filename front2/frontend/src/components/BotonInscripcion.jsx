import React, { useState } from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import AxiosInstance from "./axiosInstance";

const BotonInscripcion = ({ eventId, yaInscrito, estaLleno, onCambio }) => {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("success"); // success | error

  const mostrarMensaje = (texto, tipoMensaje = "success") => {
    setMensaje(texto);
    setTipo(tipoMensaje);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInscribirse = async () => {
    try {
      const res = await AxiosInstance.post(`/eventos/${eventId}/inscribirse/`);
      mostrarMensaje(res.data.message, "success");
      onCambio?.();
    } catch (err) {
      mostrarMensaje(
        err.response?.data?.error || "Error al inscribirse.",
        "error"
      );
    }
  };

  const handleDesinscribirse = async () => {
    try {
      const res = await AxiosInstance.post(
        `/eventos/${eventId}/desinscribirse/`
      );
      mostrarMensaje(res.data.message, "success");
      onCambio?.();
    } catch (err) {
      mostrarMensaje(
        err.response?.data?.error || "Error al desinscribirse.",
        "error"
      );
    }
  };

  if (!yaInscrito && estaLleno) {
    return (
      <>
        <span
          style={{
            color: "gray",
            fontStyle: "italic",
            marginTop: "8px",
            display: "inline-block",
          }}
        >
          Evento lleno
        </span>
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleClose}
            severity={tipo}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {mensaje}
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      {yaInscrito ? (
        <Button
          variant="outlined"
          size="small"
          onClick={handleDesinscribirse}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            marginTop: "8px",
            borderColor: hovered ? "#c62828" : "#2e7d32",
            color: hovered ? "#c62828" : "#2e7d32",
            backgroundColor: hovered ? "#fceaea" : "#e8f5e9",
            fontWeight: "bold",
            transition: "all 0.2s ease-in-out",
            borderRadius: "20px",
          }}
        >
          {hovered ? "Desinscribirse" : "Inscrito"}
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleInscribirse}
          style={{
            marginTop: "8px",
            borderRadius: "20px",
            fontWeight: "bold",
          }}
        >
          Inscribirme
        </Button>
      )}

      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleClose}
          severity={tipo}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {mensaje}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BotonInscripcion;
