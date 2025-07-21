import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { useState } from 'react';
import AxiosInstance from "./axiosInstance";

const CommentTree = ({ comment, onReply, myData }) => {
    const [replying, setReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [openReport, setOpenReport] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportError, setReportError] = useState("");
    const [reportSuccess, setReportSuccess] = useState("");
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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
            <Box id={`comentario-${comment.id}`} sx={{ pl: comment.parent ? 4 : 0 }}>
                <Typography variant="subtitle2" color="text.secondary">
                    {comment.author_username} • {new Date(comment.created_at).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    {comment.content}
                </Typography>

                {!replying ? (
                    <Button
                        size="small"
                        onClick={() => setReplying(true)}
                    >
                        Responder
                    </Button>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                        <TextField
                            label="Tu respuesta"
                            multiline
                            minRows={2}
                            value={replyContent}
                            onChange={e => setReplyContent(e.target.value)}
                            fullWidth
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleReplySubmit}
                            >
                                Enviar
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    setReplying(false);
                                    setReplyContent('');
                                }}
                            >
                                Cancelar
                            </Button>
                        </Box>
                    </Box>
                )}

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => setOpenReport(true)}
                    >
                        Reportar
                    </Button>
                    {myData?.is_staff && (
                        <>
                            <Button
                                size="small"
                                color="error"
                                onClick={() => setOpenDeleteDialog(true)}
                            >
                                Eliminar Comentario
                            </Button>
                            <Dialog
                                open={openDeleteDialog}
                                onClose={() => setOpenDeleteDialog(false)}
                            >
                                <DialogTitle>Confirmar eliminación</DialogTitle>
                                <DialogContent>
                                    ¿Estás seguro de que deseas eliminar este comentario? Esta acción no se puede deshacer.
                            </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
                                    <Button
                                        color="error"
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
                                    >
                                        Sí, eliminar
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </>
                    )}
                </div>

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
