import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import AxiosInstance from "./axiosInstance";
import BotonInscripcion from "./BotonInscripcion";
import CommentTree from "./CommentTree";
import defaultAvatar from "../assets/default-avatar.jpg";
import {
  Box,
  Typography,
  TextField,
  Divider,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Menu,
} from "@mui/material";
import {
  LocationOn,
  CalendarToday,
  Person,
  Group,
  Category,
  ArrowBack,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import EditarEventoDialog from "./EditarEventoDialog";
import "./VerEvento.css";

const VerEvento = () => {
  const [evento, setEvento] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesNuevas, setImagenesNuevas] = useState([]);

  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [myData, setMyData] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [comments, setComments] = useState([]);
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);

  const [openReportModal, setOpenReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Estados para el modal de participantes
  const [openParticipantsModal, setOpenParticipantsModal] = useState(false);
  const [participantsData, setParticipantsData] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  
  // Estados para el menú de tres puntos del evento
  const [anchorElEvent, setAnchorElEvent] = useState(null);
  const openEventMenu = Boolean(anchorElEvent);

  const handleEventMenuClick = (event) => {
    setAnchorElEvent(event.currentTarget);
  };

  const handleEventMenuClose = () => {
    setAnchorElEvent(null);
  };

  const handleReportEventClick = () => {
    handleEventMenuClose();
    setOpenReportModal(true);
  };

  const handleEditEventClick = () => {
    handleEventMenuClose();
    handleOpenEditDialog();
  };

  const handleDeleteEventClick = () => {
    handleEventMenuClose();
    setOpenDeleteDialog(true);
  };

  // Funciones para el modal de participantes
  const handleOpenParticipantsModal = async () => {
    setLoadingParticipants(true);
    try {
      const response = await AxiosInstance.get(`/eventos/${id}/inscritos/`);
      if (Array.isArray(response.data)) {
        setParticipantsData(response.data);
        setOpenParticipantsModal(true);
      } else {
        console.error("Respuesta no válida:", response.data);
      }
    } catch (error) {
      console.error("Error al obtener los participantes:", error.response?.data || error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleCloseParticipantsModal = () => {
    setOpenParticipantsModal(false);
    setParticipantsData([]);
  };

  // estado para el diálogo de edición
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
    category: "",
    max_participants: "",
  });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const handleReportEvent = async () => {
    try {
      await AxiosInstance.post("/event-reports/", {
        event: id,
        reason: reportReason,
      });
      setReportSuccess(
        "Reporte enviado correctamente. Un moderador lo revisará."
      );
      setReportReason("");
      setTimeout(() => setOpenReportModal(false), 1500);
    } catch (error) {
      console.error(error);
      setReportError("Error al enviar el reporte. Intenta nuevamente.");
    }
  };

  const fetchEvento = async () => {
    try {
      const response = await AxiosInstance.get(`eventos/${id}/`);
      setEvento(response.data);
      setImagenes(response.data.imagenes || []);
      console.log("Evento fetched:", response.data);
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await AxiosInstance.get("categories/");
      setCategoriasDisponibles(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await AxiosInstance.get("user_data/");
      setMyData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchComments = useCallback(async () => {
    if (!hasMore || loadingComments) return;
    setLoadingComments(true);
    try {
      const response = await AxiosInstance.get(
        `/comments/?evento=${id}&page=${nextPage}`
      );
      setComments((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const newComments = response.data.results.filter(
          (c) => !existingIds.has(c.id)
        );
        return [...prev, ...newComments];
      });
      setHasMore(response.data.next !== null);
      setNextPage((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingComments(false);
    }
  }, [id, nextPage, hasMore, loadingComments]);

  const reloadComments = async () => {
    try {
      const response = await AxiosInstance.get(
        `/comments/?evento=${id}&page=1`
      );
      setComments(response.data.results);
      setNextPage(2);
      setHasMore(response.data.next !== null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      await AxiosInstance.post("/comments/", {
        evento: id,
        content,
        parent: parentId,
      });
      await reloadComments();
    } catch (error) {
      console.error(error);
    }
  };

  const handleNewComment = async () => {
    if (!newCommentContent.trim()) return;
    try {
      await AxiosInstance.post("/comments/", {
        evento: id,
        content: newCommentContent,
        notify_event_author: true,
      });
      setNewCommentContent("");
      await reloadComments();
    } catch (error) {
      console.error(error);
    }
  };

  const [newCommentContent, setNewCommentContent] = useState("");

  useEffect(() => {
    fetchEvento();
    fetchCategorias();
    fetchUserData();
    setComments([]);
    setNextPage(1);
    setHasMore(true);
    fetchComments();
  }, [id]);

  // useEffect(() => {
  //     fetchComments();
  // }, [fetchComments]);

  useEffect(() => {
    // espera a que los comentarios estén cargados
    if (comments.length > 0) {
      const params = new URLSearchParams(location.search);
      const comentarioId = params.get("comentario");
      if (comentarioId) {
        // espera un pequeño delay para asegurar que el DOM esté listo
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
  }, [comments, location.search]);

  // Intersection Observer to trigger load
  const observer = useRef();
  const lastCommentRef = useCallback(
    (node) => {
      if (loadingComments) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchComments();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loadingComments, hasMore, fetchComments]
  );

  const isAuthenticated = !!localStorage.getItem("Token");

  const handleRedirect = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };

  // cuando se abre el diálogo, llena los datos actuales
  const handleOpenEditDialog = () => {
    setEditData({
      title: evento.title || "",
      description: evento.description || "",
      event_date: evento.event_date ? evento.event_date.slice(0, 16) : "", // formato YYYY-MM-DDTHH:mm
      location: evento.location || "",
      category: evento.category || "",
      max_participants: evento.max_participants || "",
    });
    setEditError("");
    setOpenEditDialog(true);
  };

  // handler para cambios en los campos
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // guardar cambios
  const handleEditSubmit = async () => {
    setEditLoading(true);
    setEditError("");
    try {
      await AxiosInstance.patch(`/eventos/${evento.id}/`, {
        ...editData,
      });
      setOpenEditDialog(false);
      await fetchEvento(); // recarga datos del evento
    } catch (err) {
      console.error(err);
      setEditError("Error al guardar los cambios. Revisa los campos.");
    } finally {
      setEditLoading(false);
    }
  };

  if (!evento || !myData) {
    return <div>Cargando...</div>;
  }

  console.log("myData", myData);

  const yaInscrito = evento.participants.includes(myData.email);
  const estaLleno =
    evento.participants.length >=
    (evento.max_participants || evento.limite_asistentes || 0);

  // Solo comentarios raíz
  const rootComments = comments.filter((c) => c.parent === null);

  return (
    <div className="contenedor-ver-evento">
      {/* Botón de volver */}
      <Button
        onClick={handleRedirect}
        className="boton-volver"
        startIcon={<ArrowBack />}
        sx={{
          textTransform: "none",
          fontSize: "0.9rem",
          fontWeight: "normal",
        }}
      >
        Volver
      </Button>

      {/* Header del evento */}
      <div className="bloque-evento">
        <div className="header-evento" style={{ position: 'relative' }}>
          {/* Menú de tres puntos - Solo si hay opciones disponibles */}
          {((isAuthenticated && myData.username !== evento.author_username) || 
            (myData.email === evento.author || myData.username === evento.author_username) || 
            myData.is_staff) && (
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 1 }}>
              <IconButton
                onClick={handleEventMenuClick}
                sx={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                  }
                }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorElEvent}
                open={openEventMenu}
                onClose={handleEventMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {isAuthenticated && myData.username !== evento.author_username && (
                  <MenuItem onClick={handleReportEventClick}>
                    <span style={{ color: '#d32f2f' }}>⚠️ Reportar evento</span>
                  </MenuItem>
                )}
                {(myData.email === evento.author || myData.username === evento.author_username) && (
                  <MenuItem onClick={handleEditEventClick}>
                    <span style={{ color: '#1976d2' }}>✏️ Editar evento</span>
                  </MenuItem>
                )}
                {(myData.is_staff || myData.email === evento.author || myData.username === evento.author_username) && (
                  <MenuItem onClick={handleDeleteEventClick}>
                    <span style={{ color: '#d32f2f' }}>🗑️ Eliminar evento</span>
                  </MenuItem>
                )}
              </Menu>
            </div>
          )}

          <h1 className="titulo-evento">{evento.title}</h1>
          <div className="info-basica-evento">
            <div className="info-item" onClick={() => navigate(`/perfil-publico/${evento.author_username}`)} style={{ cursor: 'pointer' }}>
              <Person />
              <span>{evento.author_username}</span>
            </div>
            <div className="info-item" onClick={handleOpenParticipantsModal} style={{ cursor: 'pointer' }}>
              <Group />
              <span>{evento.participants.length}/{evento.max_participants}</span>
            </div>
            <div className="info-item" onClick={() => navigate('/buscar', { state: { selectedCategory: evento.category } })} style={{ cursor: 'pointer' }}>
              <Category />
              <span>
                {categoriasDisponibles.find((cat) => cat.id === evento.category)?.name || "Sin categoría"}
              </span>
            </div>
          </div>
          
          {/* Botón principal de inscripción en el header */}
          <div className="accion-principal">
            <BotonInscripcion
              eventId={evento.id}
              yaInscrito={yaInscrito}
              estaLleno={estaLleno}
              onCambio={fetchEvento}
            />
          </div>
        </div>

        {/* Información del evento */}
        <div className="contenido-evento">
          <div className="seccion-evento">
            <h3 className="titulo-seccion">
              📋 Información del Evento
            </h3>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-label">Ubicación</div>
                <div className="info-value">
                  <LocationOn fontSize="small" style={{ verticalAlign: "middle", marginRight: "4px" }} />
                  {evento.location}
                </div>
              </div>
              <div className="info-card">
                <div className="info-label">Fecha y Hora</div>
                <div className="info-value">
                  <CalendarToday fontSize="small" style={{ verticalAlign: "middle", marginRight: "4px" }} />
                  {new Date(evento.event_date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="seccion-evento">
            <h3 className="titulo-seccion">
              📝 Descripción
            </h3>
            <p className="descripcion-evento">{evento.description}</p>
          </div>

          {/* Sección de imágenes */}
          <div className="seccion-evento">
            <h3 className="titulo-seccion">
              🖼️ Imágenes del Evento
            </h3>
            {imagenes.length > 0 ? (
              <div className="imagenes-evento">
                {imagenes.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img.url} 
                    alt={`imagen-${idx}`} 
                    className="imagen-evento"
                  />
                ))}
              </div>
            ) : (
              <div className="imagenes-placeholder">
                <div className="placeholder-item">
                  <div className="placeholder-icon">📷</div>
                  <p>Imágenes</p>
                  <small>Los organizadores podrán subir fotos del evento</small>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección de comentarios */}
      <div className="comentarios-seccion">
        <div className="comentarios-header">
          <div className="comentarios-resumen">
            <ChatBubbleOutlineIcon
              fontSize="small"
              style={{ marginRight: "6px" }}
            />
            {rootComments.length} comentario{rootComments.length !== 1 && "s"}
          </div>
        </div>
        
        <div className="comentarios-contenido">
          <div className="comentario-nuevo">
            <img
              src={
                myData?.profile_picture
                  ? `http://localhost:8000${myData.profile_picture}`
                  : "https://via.placeholder.com/40x40/cccccc/666666?text=👤"
              }
              alt="Tu avatar"
              className="comentario-avatar"
            />
            <input
              type="text"
              placeholder="Escribe un comentario..."
              className="comentario-input"
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleNewComment();
                }
              }}
            />
            <button 
              onClick={handleNewComment} 
              className="comentario-boton"
              disabled={!newCommentContent.trim()}
            >
              Enviar
            </button>
          </div>

          {rootComments.length === 0 && !loadingComments ? (
            <div className="sin-comentarios">
              <h3>🤔 Aún no hay comentarios</h3>
              <p>¡Sé el primero en comentar sobre este evento!</p>
            </div>
          ) : (
            <div className="comentarios-lista">
              {rootComments.map((comment, index) => {
                const isLast = rootComments.length === index + 1;
                return (
                  <div 
                    key={comment.id} 
                    ref={isLast ? lastCommentRef : null}
                    className="comentario-item-wrapper"
                  >
                    <CommentTree
                      comment={comment}
                      onReply={handleReply}
                      myData={myData}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {loadingComments && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </div>
      </div>

      {/* Diálogos */}
      <Dialog
        open={openReportModal}
        onClose={() => {
          setOpenReportModal(false);
          setReportError("");
          setReportSuccess("");
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reportar Evento</DialogTitle>
        <DialogContent>
          {reportError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {reportError}
            </Alert>
          )}
          {reportSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {reportSuccess}
            </Alert>
          )}

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Motivo del Reporte</InputLabel>
            <Select
              label="Motivo del Reporte"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <MenuItem value="offensive">
                Contenido ofensivo o lenguaje inapropiado
              </MenuItem>
              <MenuItem value="discriminatory">
                Contenido discriminatorio
              </MenuItem>
              <MenuItem value="spam">Spam o publicidad no autorizada</MenuItem>
              <MenuItem value="unrelated">Contenido no relacionado</MenuItem>
              <MenuItem value="false">Información falsa o engañosa</MenuItem>
              <MenuItem value="violence">
                Incitación a la violencia o actividades ilegales
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportModal(false)}>Cancelar</Button>
          <Button
            onClick={handleReportEvent}
            variant="contained"
            color="error"
            disabled={!reportReason}
          >
            Enviar Reporte
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          fontSize: '1.3rem',
          fontWeight: 600,
          color: '#d32f2f'
        }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '0.5rem',
            color: '#ff6b6b'
          }}>
            🗑️
          </div>
          Eliminar Evento
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pt: 1, pb: 3 }}>
          <Box sx={{
            background: '#fff3f3',
            border: '1px solid #ffe0e0',
            borderRadius: 2,
            p: 2.5,
            mb: 2
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 1,
              color: '#d32f2f'
            }}>
              "{evento?.title}"
            </Typography>
            <Typography variant="body1" sx={{ 
              color: '#666',
              lineHeight: 1.6,
              fontSize: '0.95rem'
            }}>
              ¿Estás seguro de que deseas eliminar este evento?
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#999',
              mt: 1.5,
              fontStyle: 'italic',
              fontSize: '0.85rem'
            }}>
              ⚠️ Esta acción no se puede deshacer
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ 
            color: '#757575',
            fontSize: '0.9rem'
          }}>
            Se eliminarán todos los comentarios y la información asociada al evento.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ 
          px: 3, 
          pb: 3, 
          pt: 0,
          justifyContent: 'center',
          gap: 2
        }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: '20px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: '#ddd',
              color: '#666',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              try {
                await AxiosInstance.delete(`/eventos/${evento.id}/`);
                setOpenDeleteDialog(false);
                alert("Evento eliminado correctamente.");
                navigate("/home");
              } catch {
                alert("Error al eliminar el evento.");
              }
            }}
            sx={{
              backgroundColor: '#ff6b6b',
              borderRadius: '20px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#ff5252'
              }
            }}
          >
            🗑️ Sí, eliminar evento
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de participantes */}
      <Dialog
        open={openParticipantsModal}
        onClose={handleCloseParticipantsModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '1.3rem',
            pb: 1,
            background: 'rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          👥 Participantes ({participantsData.length})
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          {loadingParticipants ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress color="inherit" />
            </Box>
          ) : participantsData.length === 0 ? (
            <Box textAlign="center" py={3}>
              <Typography variant="body1" sx={{ opacity: 0.8 }}>
                No hay participantes inscritos aún
              </Typography>
            </Box>
          ) : (
            <Box>
              {participantsData.map((participant) => (
                <Box
                  key={participant.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 1.5,
                    px: 2,
                    mb: 1,
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.2)',
                      transform: 'translateX(4px)'
                    }
                  }}
                  onClick={() => {
                    handleCloseParticipantsModal();
                    navigate(`/perfil-publico/${encodeURIComponent(participant.username)}`);
                  }}
                >
                  <Box
                    sx={{
                      width: 45,
                      height: 45,
                      borderRadius: '50%',
                      backgroundImage: participant.profile_picture 
                        ? `url(${participant.profile_picture.startsWith('http') 
                            ? participant.profile_picture 
                            : `http://localhost:8000${participant.profile_picture}`})`
                        : `url(${defaultAvatar})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      border: '2px solid rgba(255,255,255,0.3)',
                      flexShrink: 0
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: '1rem'
                      }}
                    >
                      {participant.username}
                    </Typography>
                    {participant.full_name && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          opacity: 0.8,
                          fontSize: '0.85rem'
                        }}
                      >
                        {participant.full_name}
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            onClick={handleCloseParticipantsModal}
            variant="outlined"
            fullWidth
            sx={{
              borderRadius: '20px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 500,
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&:hover': {
                borderColor: 'rgba(255,255,255,0.8)',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <EditarEventoDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        editData={editData}
        onChange={handleEditChange}
        onSubmit={handleEditSubmit}
        loading={editLoading}
        error={editError}
        categorias={categoriasDisponibles}
        imagenesExistentes={imagenes}             // <--- asegurar que esté inicializado como []
        setImagenesExistentes={setImagenes}
        imagenesNuevas={imagenesNuevas}                     // <--- asegurar que esté inicializado como []
        setImagenesNuevas={setImagenesNuevas}
        
      />
    </div>
  );
};

const styles = {
  // Ya no necesitamos estos estilos, todo se maneja con CSS
};

export default VerEvento;
