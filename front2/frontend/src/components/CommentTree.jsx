import { Box, Typography, Button, TextField } from '@mui/material';
import { useState } from 'react';

const CommentTree = ({ comment, onReply }) => {
    const [replying, setReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');

    const handleReplySubmit = () => {
        if (!replyContent.trim()) return;
        onReply(comment.id, replyContent);
        setReplyContent('');
        setReplying(false);
    };

    return (
        <Box sx={{ pl: comment.parent ? 4 : 0 }}>
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

            {comment.replies && comment.replies.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    {comment.replies.map(reply => (
                        <CommentTree key={reply.id} comment={reply} onReply={onReply} />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default CommentTree;
