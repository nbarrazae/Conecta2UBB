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
import { useNavigate, useLocation, Link } from "react-router-dom";
import './adminReports.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import Tooltip from '@mui/material/Tooltip';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const AdminCommentReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingActionId, setPendingActionId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchReports = () => {
    AxiosInstance.get("comment-reports/").then((res) => {
      setReports(res.data);
      setLoading(false);
    });
  };

  const handleAction = (id, action) => {
    AxiosInstance.post(`comment-reports/${id}/${action}/`).then(() => fetchReports());
  };

  const handleOpenComment = (commentId) => {
    if (commentId) {
      AxiosInstance.get(`comments/${commentId}/`)
        .then((res) => {
          setComment(res.data);
          setOpen(true);
        })
        .catch(() => {
          setComment(null);
          setOpen(true);
        });
    } else {
      setComment(null);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (reports.length > 0) {
      const params = new URLSearchParams(location.search);
      const comentarioId = params.get("comentario");
      if (comentarioId) {
        setTimeout(() => {
          const el = document.getElementById(`comentario-${comentarioId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.style.background = "#e3f2fd";
            setTimeout(() => {
              el.style.background = "";
            }, 2000);
          }
        }, 300);
      }
    }
  }, [reports, location.search]);

  const columns = [
    { field: "id", headerName: "ID", width: 70, headerClassName: "header-bold" },
    {
      field: "comment",
      headerName: "Comentario",
      width: 100,
      headerClassName: "header-bold",
      renderCell: (params) =>
        params.value
          ? `ID: ${params.value}`
          : <span className="eliminado">Eliminado</span>,
    },
    {
      field: "reporter",
      headerName: "Reportado por",
      width: 180,
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
    { field: "reason_display", headerName: "Razón", width: 250 },
    {
      field: "status_display",
      headerName: "Estado",
      width: 140,
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
      headerName: "Ver comentario",
      width: 165,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOpenComment(params.row.comment)}
          disabled={!params.row.comment}
        >
          Ver Detalle
        </Button>
      ),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 190,
      renderCell: (params) =>
        params.row.status === "pending" && params.row.comment ? (
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
    const aDeleted = !a.comment;
    const bDeleted = !b.comment;

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
        {/* <h2>Gestión de Reportes de Comentarios</h2> */}
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
          onExited={() => setComment(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Comentario Reportado</DialogTitle>
          <DialogContent>
            {comment ? (
              <div>
                <p>
                  <strong>Autor:</strong> {comment.author_username}
                </p>
                <p>
                  <strong>Contenido:</strong> {comment.content}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(comment.created_at).toLocaleString()}
                </p>
                {comment.parent && (
                  <p>
                    <strong>Respuesta a:</strong> ID {comment.parent}
                  </p>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/ver-evento/${comment.evento}?comentario=${comment.id}`)}
                >
                  Ir al comentario
                </Button>
              </div>
            ) : (
              <div>
                <p>El comentario ha sido eliminado o no está disponible.</p>
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
              ¿Estás seguro de que deseas aceptar este reporte? Esta acción eliminará el comentario reportado de forma permanente.
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

export default AdminCommentReports;