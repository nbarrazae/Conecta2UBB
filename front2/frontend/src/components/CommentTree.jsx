import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
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
  Menu
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from "./axiosInstance";

const CommentTree = ({ comment, onReply, myData }) => {
    const navigate = useNavigate();
    const [replying, setReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [openReport, setOpenReport] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportError, setReportError] = useState("");
    const [reportSuccess, setReportSuccess] = useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleReportClick = () => {
        handleMenuClose();
        setOpenReport(true);
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setOpenDeleteDialog(true);
    };

    const handleReplySubmit = () => {
        if (!replyContent.trim()) return;
        onReply(comment.id, replyContent);
        setReplyContent('');
        setReplying(false);
    };

    const handleReport = async () => {
        try {
            await AxiosInstance.post("/comment-reports/", {
                comment: comment.id,
                reason: reportReason,
            });
            setReportSuccess("Reporte enviado correctamente. Un moderador lo revisará.");
            setReportReason("");
            setTimeout(() => setOpenReport(false), 1500);
        } catch (error) {
            console.error(error);
            setReportError("Error al enviar el reporte. Intenta nuevamente.");
        }
    };

    return (
        <div>
            <Box id={`comentario-${comment.id}`} sx={{ pl: comment.parent ? 2 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {/* Avatar del usuario */}
                    <img
                        src={
                            comment.author_profile_picture
                                ? comment.author_profile_picture
                                : "https://via.placeholder.com/36x36/cccccc/666666?text=👤"
                        }
                        alt="Avatar"
                        style={{
                            width: '36px',
                            height: '36px',
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '1px solid #ddd',
                            flexShrink: 0
                        }}
                    />
                    
                    {/* Contenido del comentario */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <Typography 
                                        variant="subtitle2" 
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            fontSize: '0.9rem',
                                            color: '#333',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                color: '#1976d2',
                                                textDecoration: 'underline'
                                            }
                                        }}
                                        onClick={() => navigate(`/perfil-publico/${encodeURIComponent(comment.author_username)}`)}
                                    >
                                        {comment.author_username}
                                    </Typography>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: '#666',
                                            fontSize: '0.75rem',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        {new Date(comment.created_at).toLocaleString("es-CL", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Typography>
                                </div>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontSize: '0.85rem',
                                        color: '#333',
                                        lineHeight: 1.4,
                                        marginBottom: '8px'
                                    }}
                                >
                                    {comment.content}
                                </Typography>
                            </div>

                            {/* Menú de tres puntos - Solo si hay opciones disponibles */}
                            {(myData?.username !== comment.author_username || myData?.username === comment.author_username || myData?.is_staff) && (
                                <div>
                                    <IconButton
                                        size="small"
                                        onClick={handleMenuClick}
                                        sx={{ 
                                            opacity: 0.6,
                                            '&:hover': { opacity: 1 },
                                            padding: '4px'
                                        }}
                                    >
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={openMenu}
                                        onClose={handleMenuClose}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'right',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                    >
                                        {myData?.username !== comment.author_username && (
                                            <MenuItem onClick={handleReportClick}>
                                                <span style={{ color: '#d32f2f' }}>⚠️ Reportar</span>
                                            </MenuItem>
                                        )}
                                        {(myData?.username === comment.author_username || myData?.is_staff) && (
                                            <MenuItem onClick={handleDeleteClick}>
                                                <span style={{ color: '#d32f2f' }}>🗑️ Eliminar</span>
                                            </MenuItem>
                                        )}
                                    </Menu>
                                </div>
                            )}
                        </div>

                        {/* Botón de responder */}
                        {!replying ? (
                            <Button
                                size="small"
                                onClick={() => setReplying(true)}
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    color: '#666',
                                    padding: '2px 8px',
                                    minHeight: 'auto',
                                    '&:hover': {
                                        color: '#1976d2'
                                    }
                                }}
                            >
                                Responder
                            </Button>
                        ) : (
                            <div style={{ 
                                marginTop: '12px',
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                border: '1px solid #e9ecef'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                                    <img
                                        src={
                                            myData?.profile_picture
                                                ? `http://localhost:8000${myData.profile_picture}`
                                                : "https://via.placeholder.com/32x32/cccccc/666666?text=👤"
                                        }
                                        alt="Tu avatar"
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            objectFit: 'cover',
                                            borderRadius: '50%',
                                            border: '1px solid #ddd',
                                            flexShrink: 0
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Escribe tu respuesta..."
                                        value={replyContent}
                                        onChange={e => setReplyContent(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleReplySubmit();
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: '8px 12px',
                                            border: '1px solid #ccc',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            outline: 'none',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                                        onBlur={(e) => e.target.style.borderColor = '#ccc'}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={handleReplySubmit}
                                        disabled={!replyContent.trim()}
                                        style={{
                                            backgroundColor: '#1976d2',
                                            color: 'white',
                                            border: 'none',
                                            padding: '6px 16px',
                                            borderRadius: '16px',
                                            cursor: replyContent.trim() ? 'pointer' : 'not-allowed',
                                            fontSize: '0.8rem',
                                            transition: 'background-color 0.2s',
                                            opacity: replyContent.trim() ? 1 : 0.5
                                        }}
                                        onMouseOver={(e) => {
                                            if (replyContent.trim()) {
                                                e.target.style.backgroundColor = '#1565c0';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (replyContent.trim()) {
                                                e.target.style.backgroundColor = '#1976d2';
                                            }
                                        }}
                                    >
                                        Responder
                                    </button>
                                    <button
                                        onClick={() => {
                                            setReplying(false);
                                            setReplyContent('');
                                        }}
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: '#666',
                                            border: '1px solid #ccc',
                                            padding: '6px 16px',
                                            borderRadius: '16px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = '#f5f5f5';
                                            e.target.style.borderColor = '#999';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'transparent';
                                            e.target.style.borderColor = '#ccc';
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                )}
                    </div>
                </div>

                {/* Diálogos */}
                <Dialog
                    open={openReport}
                    onClose={() => {
                        setOpenReport(false);
                        setReportError("");
                        setReportSuccess("");
                    }}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle>Reportar Comentario</DialogTitle>
                    <DialogContent>
                        {reportError && <Alert severity="error" sx={{ mb: 2 }}>{reportError}</Alert>}
                        {reportSuccess && <Alert severity="success" sx={{ mb: 2 }}>{reportSuccess}</Alert>}
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Motivo del Reporte</InputLabel>
                            <Select
                                label="Motivo del Reporte"
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                            >
                                <MenuItem value="offensive">Contenido ofensivo o lenguaje inapropiado</MenuItem>
                                <MenuItem value="discriminatory">Contenido discriminatorio</MenuItem>
                                <MenuItem value="spam">Spam o publicidad no autorizada</MenuItem>
                                <MenuItem value="unrelated">Contenido no relacionado</MenuItem>
                                <MenuItem value="false">Información falsa o engañosa</MenuItem>
                                <MenuItem value="violence">Incitación a la violencia o actividades ilegales</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenReport(false)}>Cancelar</Button>
                        <Button
                            onClick={handleReport}
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
                        paddingBottom: '8px',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        color: '#d32f2f'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{ 
                                fontSize: '3rem',
                                color: '#ff6b6b',
                                marginBottom: '8px'
                            }}>
                                🗑️
                            </div>
                            {myData?.username === comment.author_username ? 
                                'Eliminar tu comentario' : 
                                'Eliminar comentario'
                            }
                        </div>
                    </DialogTitle>
                    <DialogContent sx={{ 
                        textAlign: 'center',
                        paddingTop: '8px',
                        paddingBottom: '24px'
                    }}>
                        <div style={{ 
                            backgroundColor: '#fff3f3',
                            border: '1px solid #ffe0e0',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '16px'
                        }}>
                            <Typography variant="body1" sx={{ 
                                color: '#666',
                                lineHeight: 1.5,
                                marginBottom: '8px'
                            }}>
                                {myData?.username === comment.author_username ? 
                                    '¿Estás seguro de que quieres eliminar tu comentario?' :
                                    '¿Estás seguro de que quieres eliminar este comentario?'
                                }
                            </Typography>
                            <Typography variant="body2" sx={{ 
                                color: '#999',
                                fontSize: '0.85rem',
                                fontStyle: 'italic'
                            }}>
                                ⚠️ Esta acción no se puede deshacer
                            </Typography>
                        </div>
                        
                        {/* Vista previa del comentario */}
                        <div style={{ 
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #e9ecef',
                            borderRadius: '8px',
                            padding: '12px',
                            textAlign: 'left',
                            maxHeight: '80px',
                            overflow: 'hidden'
                        }}>
                            <Typography variant="body2" sx={{ 
                                color: '#666',
                                fontStyle: 'italic',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical'
                            }}>
                                "{comment.content}"
                            </Typography>
                        </div>
                    </DialogContent>
                    <DialogActions sx={{ 
                        padding: '16px 24px',
                        gap: '12px',
                        justifyContent: 'center'
                    }}>
                        <Button 
                            onClick={() => setOpenDeleteDialog(false)}
                            variant="outlined"
                            sx={{ 
                                borderRadius: '20px',
                                textTransform: 'none',
                                paddingX: '24px',
                                paddingY: '8px',
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
                            variant="contained"
                            onClick={async () => {
                                try {
                                    await AxiosInstance.delete(`/comments/${comment.id}/`);
                                    setOpenDeleteDialog(false);
                                    window.location.reload();
                                } catch {
                                    alert("Error al eliminar el comentario.");
                                }
                            }}
                            sx={{
                                backgroundColor: '#ff6b6b',
                                borderRadius: '20px',
                                textTransform: 'none',
                                paddingX: '24px',
                                paddingY: '8px',
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#ff5252'
                                }
                            }}
                        >
                            🗑️ Sí, eliminar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            {comment.replies && comment.replies.length > 0 && (
                <div style={{ marginLeft: 24 }}>
                    {comment.replies.map(reply => (
                        <CommentTree
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            myData={myData}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentTree;
