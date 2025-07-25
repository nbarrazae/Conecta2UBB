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
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip from '@mui/material/Tooltip';
import { 
  Box, 
  Typography,
  IconButton
} from "@mui/material";
import {
  Person,
  CalendarToday,
  LocationOn,
  Group
} from "@mui/icons-material";

// componente reutilizable para el icono de estado
const StatusIcon = ({ status, fontSize = "small" }) => {
  const iconProps = { fontSize, sx: { verticalAlign: 'middle' } };
  
  switch(status) {
    case "pending":
      return <HourglassEmptyIcon {...iconProps} color="warning" />;
    case "accepted":
      return <CheckCircleIcon {...iconProps} color="success" />;
    case "rejected":
      return <CancelIcon {...iconProps} color="error" />;
    default:
      return <HelpOutlineIcon {...iconProps} color="disabled" />;
  }
};

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [evento, setEvento] = useState(null);
  const [reportData, setReportData] = useState(null);
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

  const handleOpenEvento = (eventId, reportId) => {
    if (eventId && eventId !== "Evento eliminado") {
      AxiosInstance.get(`eventos/${eventId}/`).then((res) => {
        setEvento(res.data);
        
        if (reportId) {
          const report = reports.find(r => r.id === reportId);
          setReportData(report);
        }
        
        setOpen(true);
      });
    } else {
      setEvento(null);
      
      if (reportId) {
        const report = reports.find(r => r.id === reportId);
        setReportData(report);
      }
      
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setReportData(null);
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
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusIcon status={params.row.status} />
          <span>{params.value}</span>
        </Box>
      )
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
          onClick={() => handleOpenEvento(params.row.event, params.row.id)}
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
              <IconButton
                size="small"
                color="success"
                onClick={() => {
                  setPendingActionId(params.row.id);
                  setConfirmOpen(true);
                }}
              >
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rechazar">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleAction(params.row.id, "reject")}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
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

        {/* Diálogo de detalles del reporte */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }
          }}
        >
          <DialogTitle
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '1.3rem',
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <ReportProblemIcon fontSize="large" />
            <span>Detalles del Reporte</span>
          </DialogTitle>
          
          <DialogContent sx={{ py: 3 }}>
            {/* Sección de información del reporte */}
            {reportData && (
              <Box sx={{
                border: '1px solid #ffebee',
                borderRadius: '8px',
                p: 2,
                background: '#fff5f5',
                mb: 3
              }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600, 
                  mb: 1,
                  color: '#d32f2f',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  ⚠️ Información del Reporte
                </Typography>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                  mb: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person fontSize="small" color="error" />
                    <Typography variant="body1">
                      <strong>Reportado por:</strong>{' '}
                      {reportData.reporter ? (
                        <Link
                          to={`/perfil-publico/${encodeURIComponent(
                            reportData.reporter.includes('@') 
                              ? reportData.reporter.split('@')[0] 
                              : reportData.reporter
                          )}`}
                          style={{
                            color: '#1976d2',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                          }}
                        >
                          {reportData.reporter.includes('@') 
                            ? reportData.reporter.split('@')[0] 
                            : reportData.reporter}
                        </Link>
                      ) : 'Desconocido'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReportProblemIcon fontSize="small" color="error" />
                    <Typography variant="body1">
                      <strong>Motivo:</strong> {reportData.reason_display || 'No especificado'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusIcon status={reportData.status} />
                    <Typography variant="body1">
                      <strong>Estado:</strong> {reportData.status_display || 'Pendiente'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" color="error" />
                    <Typography variant="body1">
                      <strong>Fecha reporte:</strong> {reportData.created_at ? new Date(reportData.created_at).toLocaleString('es-ES') : 'Desconocida'}
                    </Typography>
                  </Box>
                </Box>
                
                {reportData.additional_notes && (
                  <Box sx={{ mt: 1, p: 1, background: '#ffebee', borderRadius: '4px' }}>
                    <Typography variant="body2">
                      <strong>Notas adicionales:</strong> {reportData.additional_notes}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {evento ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 3 
              }}>
                {/* Sección de información básica del evento */}
                <Box sx={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  p: 2,
                  background: '#f9f9f9'
                }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 600, 
                    mb: 2,
                    color: '#333'
                  }}>
                    {evento.title}
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                    mb: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" color="primary" />
                      <Typography variant="body1">
                        <strong>Organizador:</strong>{' '}
                        <Link
                          to={`/perfil-publico/${encodeURIComponent(evento.author_username || evento.author)}`}
                          style={{
                            color: '#1976d2',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                          }}
                        >
                          {evento.author_username || evento.author}
                        </Link>
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="primary" />
                      <Typography variant="body1">
                        <strong>Fecha:</strong> {new Date(evento.event_date).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" color="primary" />
                      <Typography variant="body1">
                        <strong>Ubicación:</strong> {evento.location}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Group fontSize="small" color="primary" />
                      <Typography variant="body1">
                        <strong>Participantes:</strong> {evento.participants?.length || 0}/{evento.max_participants}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                {/* Sección de descripción del evento */}
                <Box sx={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  p: 2,
                  background: '#f9f9f9'
                }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    color: '#333',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    📝 Descripción del Evento
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6
                  }}>
                    {evento.description || "Sin descripción proporcionada."}
                  </Typography>
                </Box>
                
                {/* Sección de imágenes del evento (si existen) */}
                {evento.imagenes?.length > 0 && (
                  <Box sx={{
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    p: 2,
                    background: '#f9f9f9'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      mb: 2,
                      color: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      🖼️ Imágenes del Evento
                    </Typography>
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2
                    }}>
                      {evento.imagenes.map((img, idx) => (
                        <Box 
                          key={idx}
                          sx={{
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid #ddd',
                            height: '200px',
                            backgroundImage: `url(${img.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                background: '#fff8e1',
                borderRadius: '8px',
                border: '1px solid #ffe0b2'
              }}>
                <ReportProblemIcon color="warning" sx={{ fontSize: '3rem', mb: 2 }} />
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                  Evento no disponible
                </Typography>
                <Typography variant="body1">
                  El evento ha sido eliminado o no está accesible.
                </Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            px: 3, 
            pb: 3,
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <Button 
              onClick={handleClose}
              variant="outlined"
              sx={{
                borderRadius: '20px',
                px: 3,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Cerrar
            </Button>
            
            {evento && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleClose();
                  navigate(`/ver-evento/${evento.id}`);
                }}
                sx={{
                  borderRadius: '20px',
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Ver evento completo
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Diálogo de confirmación para aceptar reporte */}
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