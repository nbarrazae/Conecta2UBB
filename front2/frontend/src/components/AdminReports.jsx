import { useEffect, useState } from "react";
import AxiosInstance from "./axiosInstance";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [evento, setEvento] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingActionId, setPendingActionId] = useState(null);

  const fetchReports = () => {
    AxiosInstance.get("event-reports/").then((res) => {
      setReports(res.data);
      setLoading(false);
    });
  };

  const handleAction = (id, action) => {
    AxiosInstance.post(`event-reports/${id}/${action}/`).then(() => fetchReports());
  };

  const handleOpenEvento = (eventId) => {
    if (eventId && eventId !== "Evento eliminado") {
      AxiosInstance.get(`eventos/${eventId}/`).then((res) => {
        setEvento(res.data);
        setOpen(true);
      });
    } else {
      setEvento(null);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 60 },
    {
      field: "event",
      headerName: "Evento",
      width: 95,
      renderCell: (params) =>
        params.value ? params.value : "Eliminado",
    },
    { field: "reporter", headerName: "Reportado por", width: 170 },
    { field: "reason_display", headerName: "Razón", width: 405 },
    { field: "status_display", headerName: "Estado", width: 110 },
    {
      field: "ver",
      headerName: "Ver publicación",
      width: 140,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOpenEvento(params.row.event)}
          disabled={!params.row.event}
        >
          Ver Evento
        </Button>
      ),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 190,
      renderCell: (params) =>
        params.row.status === "pending" ? (
          <>
            <Button
              size="small"
              color="success"
              onClick={() => {
                setPendingActionId(params.row.id);
                setConfirmOpen(true);
              }}
            >
              Aceptar
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => handleAction(params.row.id, "reject")}
              style={{ marginLeft: 8 }}
            >
              Rechazar
            </Button>
          </>
        ) : null,
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        marginRight: 24,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: { xs: "100%", md: "calc(100vw - 640px)" },
          maxWidth: 1230,
          minWidth: 320,
          p: 3,
          mt: 2,
        }}
      >
        <h2>Gestión de Reportes de Eventos</h2>
        <DataGrid
          rows={reports}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          loading={loading}
          getRowId={(row) => row.id}
          disableSelectionOnClick
          autoHeight
        />

        <Dialog
          open={open}
          onClose={handleClose}
          onExited={() => setEvento(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Publicación Reportada</DialogTitle>
          <DialogContent>
            {evento ? (
              <div>
                <h3>{evento.title}</h3>
                <p>
                  <strong>Descripción:</strong> {evento.description}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(evento.event_date).toLocaleString()}
                </p>
                <p>
                  <strong>Ubicación:</strong> {evento.location}
                </p>
                <p>
                  <strong>Categoría:</strong> {evento.category_name}
                </p>
                <p>
                  <strong>Estado:</strong> {evento.state}
                </p>
              </div>
            ) : (
              <div>
                <p>El evento ha sido eliminado o no está disponible.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
        >
          <DialogTitle>Confirmar acción</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Estás seguro de que deseas aceptar este reporte? Esta acción eliminará el evento reportado de forma permanente.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                handleAction(pendingActionId, "accept");
                setConfirmOpen(false);
              }}
              color="error"
              variant="contained"
            >
              Sí, eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </div>
  );
};

export default AdminReports;