import { useEffect, useState } from "react";
import AxiosInstance from "./axiosInstance";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [evento, setEvento] = useState(null);

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
    setEvento(null);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "event",
      headerName: "Evento",
      width: 100,
      renderCell: (params) =>
        params.value ? params.value : "Evento eliminado",
    },
    { field: "reporter", headerName: "Reportado por", width: 180 },
    { field: "reason_display", headerName: "Razón", width: 220 },
    { field: "status_display", headerName: "Estado", width: 120 },
    {
      field: "ver",
      headerName: "Ver publicación",
      width: 160,
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
      width: 180,
      renderCell: (params) =>
        params.row.status === "pending" ? (
          <>
            <Button
              size="small"
              color="success"
              onClick={() => handleAction(params.row.id, "accept")}
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
    <div style={{ height: 600, width: "100%" }}>
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

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
    </div>
  );
};

export default AdminReports;