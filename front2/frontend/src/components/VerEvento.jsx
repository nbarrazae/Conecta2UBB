import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import AxiosInstance from "./axiosInstance";
import BotonInscripcion from "./BotonInscripcion";
import CommentTree from "./CommentTree";
import {
  Box,
  Typography,
  TextField,
  Divider,
  CircularProgress,
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
} from "@mui/material";
import EditarEventoDialog from "./EditarEventoDialog";

const VerEvento = () => {
  const [evento, setEvento] = useState(null);
  const [imagenes, setImagenes] = useState([]);
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
    const params = new URLSearchParams(location.search);
    const comentarioParam = params.get("comentario");

    if (comentarioParam) {
      setTimeout(() => {
        const targetElement =
          comentarioParam === "scroll"
            ? document.getElementById("seccion-comentarios")
            : document.getElementById(`comentario-${comentarioParam}`);

        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
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

  return (
    <div style={styles.container}>
      <Button
        onClick={handleRedirect}
        style={{
          width: "10%",
          marginLeft: "8%",
          padding: "15px",
          backgroundColor: "#007BFF",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "10px",
        }}
      >
        {isAuthenticated ? "Ir al Inicio" : "Ir al Login"}
      </Button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2 style={styles.title}>{evento.title}</h2>
        <div>
          <BotonInscripcion
            eventId={evento.id}
            yaInscrito={yaInscrito}
            estaLleno={estaLleno}
            onCambio={fetchEvento}
            style={{ marginLeft: "20px" }}
          />
          {isAuthenticated && (
            <Button
              variant="outlined"
              color="error"
              sx={{ mt: 2, ml: 2 }}
              onClick={() => setOpenReportModal(true)}
            >
              Reportar Evento
            </Button>
          )}
          {/* Botón solo para el autor */}
          {myData.email === evento.author ||
          myData.username === evento.author_username ? (
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2, ml: 2 }}
              onClick={handleOpenEditDialog}
            >
              Editar Evento
            </Button>
          ) : null}
          {/* SOLO PARA MODERADORES */}
          {myData.is_staff && (
            <Button
              variant="contained"
              color="error"
              sx={{ mt: 2, ml: 2 }}
              onClick={() => setOpenDeleteDialog(true)}
            >
              Eliminar Evento
            </Button>
          )}
        </div>
      </div>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Información</h3>
        <p>
          <strong>Lugar:</strong> {evento.location}
        </p>
        <p>
          <strong>Fecha:</strong>{" "}
          {new Date(evento.event_date).toISOString().split("T")[0]}
        </p>
        <p>
          <strong>Categoría:</strong>{" "}
          {categoriasDisponibles.find((cat) => cat.id === evento.category)
            ?.name || "Sin categoría"}
        </p>
        <p>
          <strong>Creador del Evento:</strong> {evento.author_username}
        </p>
        <p>
          <strong>Participantes:</strong> {evento.participants.length}/
          {evento.max_participants}
        </p>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          Sobre el Evento + Imagenes del Evento
        </h3>
        <p>{evento.description}</p>
        <div style={styles.imageContainer}>
          {imagenes.map((img, idx) => (
            <div key={idx} style={styles.imageWrapper}>
              <img src={img.url} alt={`imagen-${idx}`} style={styles.image} />
            </div>
          ))}
        </div>
      </div>

      {/* <BotonInscripcion
                eventId={evento.id}
                yaInscrito={yaInscrito}
                estaLleno={estaLleno}
                onCambio={fetchEvento}
            /> */}

      <Box sx={{ mt: 4 }} id="seccion-comentarios">
        <Typography variant="h5" gutterBottom>
          Comentarios
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <TextField
            label="Escribe un comentario..."
            multiline
            minRows={3}
            variant="outlined"
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleNewComment}
            disabled={!newCommentContent.trim()}
          >
            Comentar
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {comments.length === 0 && !loadingComments ? (
          <Typography variant="body1" color="text.secondary">
            Aún no hay comentarios. ¡Sé el primero en comentar!
          </Typography>
        ) : (
          comments.map((comment, index) => {
            if (comments.length === index + 1) {
              return (
                <Box
                  key={comment.id}
                  ref={lastCommentRef}
                  sx={{ mb: 2 }}
                  id={`comentario-${comment.id}`}
                >
                  <CommentTree
                    comment={comment}
                    onReply={handleReply}
                    myData={myData}
                  />
                  <Divider sx={{ my: 1 }} />
                </Box>
              );
            } else {
              return (
                <Box
                  key={comment.id}
                  sx={{ mb: 2 }}
                  id={`comentario-${comment.id}`}
                >
                  <CommentTree
                    comment={comment}
                    onReply={handleReply}
                    myData={myData}
                  />
                  <Divider sx={{ my: 1 }} />
                </Box>
              );
            }
          })
        )}

        {loadingComments && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </Box>
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

      {/* diálogo de confirmación para eliminar evento */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar este evento? Esta acción no se
          puede deshacer.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
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
          >
            Sí, eliminar
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
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1200px",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    textAlign: "center",
    fontSize: "28px",
    color: "#333",
    marginBottom: "20px",
  },
  section: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "10px",
    color: "#333",
  },
  imageContainer: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  imageWrapper: {
    textAlign: "center",
  },
  image: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
};

export default VerEvento;
