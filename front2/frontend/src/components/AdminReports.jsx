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
import { useNavigate, Link } from "react-router-dom";
import './adminReports.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import Tooltip from '@mui/material/Tooltip';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [evento, setEvento] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingActionId, setPendingActionId] = useState(null);
  const navigate = useNavigate();

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
    { field: "id", headerName: "ID", width: 60, headerClassName: "header-bold" },
    {
      field: "event",
      headerName: "Evento",
      width: 95,
      headerClassName: "header-bold",
      renderCell: (params) =>
        params.value
          ? `ID: ${params.value}`
          : <span className="eliminado">Eliminado</span>,
    },
    {
      field: "reporter",
      headerName: "Reportado por",
      width: 170,
      headerClassName: "header-bold",
      renderCell: (params) => {
        // Si el valor es un email, toma solo la parte antes del @
        const username = params.value.includes('@')
          ? params.value.split('@')[0]
          : params.value;
        return (
          <Link
            to={`/perfil-publico/${encodeURIComponent(username)}`}
            style={{ color: "#1976d2", textDecoration: "underline", cursor: "pointer" }}
          >
            {username}
          </Link>
        );
      },
    },
    { field: "reason_display", headerName: "Razón", width: 405, headerClassName: "header-bold" },
    {
      field: "status_display",
      headerName: "Estado",
      width: 140,
      headerClassName: "header-bold",
      renderCell: (params) => {
        let className = "";
        let icon = null;
        if (params.row.status === "pending") {
          className = "status-pending";
          icon = <HourglassEmptyIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />;
        }
        if (params.row.status === "accepted") {
          className = "status-accepted";
          icon = <CheckCircleIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />;
        }
        if (params.row.status === "rejected") {
          className = "status-rejected";
          icon = <CancelIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />;
        }
        return (
          <span className={className} style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
            <span>{params.value}</span>
          </span>
        );
      }
    },
    {
      field: "ver",
      headerName: "Ver publicación",
      width: 140,
      headerClassName: "header-bold",
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOpenEvento(params.row.event)}
          disabled={!params.row.event}
        >
          Ver Detalle
        </Button>
      ),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 120,
      headerClassName: "header-bold",
      renderCell: (params) =>
        params.row.status === "pending" && (params.row.comment || params.row.event) ? (
          <>
            <Tooltip title="Aceptar">
              <Button
                size="small"
                color="success"
                onClick={() => {
                  setPendingActionId(params.row.id);
                  setConfirmOpen(true);
                }}
                sx={{ minWidth: 0, padding: 0.5 }}
              >
                <CheckCircleIcon />
              </Button>
            </Tooltip>
            <Tooltip title="Rechazar">
              <Button
                size="small"
                color="error"
                onClick={() => handleAction(params.row.id, "reject")}
                sx={{ minWidth: 0, padding: 0.5, marginLeft: 1 }}
              >
                <CancelIcon />
              </Button>
            </Tooltip>
          </>
        ) : null,
    },
  ];

  const sortedReports = [...reports].sort((a, b) => {
    const aPending = a.status === "pending";
    const bPending = b.status === "pending";
    const aDeleted = !a.event || a.event === "Eliminado";
    const bDeleted = !b.event || b.event === "Eliminado";

    if (aPending && !aDeleted && (!bPending || bDeleted)) return -1;
    if (bPending && !bDeleted && (!aPending || aDeleted)) return 1;

    if (aPending && aDeleted && bPending && !bDeleted) return 1;
    if (bPending && bDeleted && aPending && !aDeleted) return -1;

    if (aPending && aDeleted && bPending && bDeleted)
      return new Date(a.created_at) - new Date(b.created_at);

    return new Date(a.created_at) - new Date(b.created_at);
  });

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
          rows={sortedReports}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          loading={loading}
          getRowId={(row) => row.id}
          disableSelectionOnClick
          autoHeight
          getRowClassName={(params) => {
            if (params.row.status === "pending") return "row-pending";
            if (params.row.status === "accepted") return "row-accepted";
            if (params.row.status === "rejected") return "row-rejected";
            return "";
          }}
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
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/ver-evento/${evento.id}`)}
                >
                  Ir a publicación
                </Button>
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