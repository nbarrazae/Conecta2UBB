import React, { useState } from "react";
import { Button, Snackbar, Alert } from "@mui/material";
import AxiosInstance from "./axiosInstance";

const BotonInscripcion = ({
  eventId,
  yaInscrito,
  estaLleno,
  onCambio,
  mostrarSnackbar, // puede venir o no
}) => {
  const [hovered, setHovered] = useState(false);

  // fallback local
  const [open, setOpen] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("success");

  const fallbackSnackbar = (mensaje, tipo = "success") => {
    setMensaje(mensaje);
    setTipo(tipo);
    setOpen(true);
  };

  const handleSuccess = (mensaje) => {
    if (mostrarSnackbar) {
      mostrarSnackbar(mensaje, "success");
    } else {
      fallbackSnackbar(mensaje, "success");
    }
  };

  const handleError = (mensaje) => {
    if (mostrarSnackbar) {
      mostrarSnackbar(mensaje, "error");
    } else {
      fallbackSnackbar(mensaje, "error");
    }
  };

  const handleInscribirse = async () => {
    try {
      const res = await AxiosInstance.post(`/eventos/${eventId}/inscribirse/`);
      handleSuccess(res.data.message);
      onCambio?.("inscrito");
    } catch (err) {
      handleError(err.response?.data?.error || "Error al inscribirse.");
    }
  };

  const handleDesinscribirse = async () => {
    try {
      const res = await AxiosInstance.post(
        `/eventos/${eventId}/desinscribirse/`
      );
      handleSuccess(res.data.message);
      onCambio?.("desinscrito");
    } catch (err) {
      handleError(err.response?.data?.error || "Error al desinscribirse.");
    }
  };

  return (
    <>
      {!yaInscrito && estaLleno ? (
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
      ) : yaInscrito ? (
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

      {/* Snackbar fallback si no se pasa mostrarSnackbar */}
      {!mostrarSnackbar && (
        <Snackbar
          open={open}
          autoHideDuration={3000}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          sx={{
            position: "fixed !important",
            bottom: "20px !important",
            right: "20px !important",
            zIndex: 13000,
            transform: "none !important",
          }}
        >
          <Alert
            onClose={() => setOpen(false)}
            severity={tipo}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {mensaje}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default BotonInscripcion;
