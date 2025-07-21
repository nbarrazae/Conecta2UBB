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
import { useNavigate, useLocation } from "react-router-dom";

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
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "comment",
      headerName: "Comentario",
      width: 100,
      renderCell: (params) =>
        params.value
          ? `ID: ${params.value}`
          : "Eliminado",
    },
    { field: "reporter", headerName: "Reportado por", width: 180 },
    { field: "reason_display", headerName: "Razón", width: 250 },
    { field: "status_display", headerName: "Estado", width: 120 },
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
          Ver Comentario
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
        <h2>Gestión de Reportes de Comentarios</h2>
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