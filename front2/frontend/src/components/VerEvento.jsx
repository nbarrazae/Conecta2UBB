import React, { useState, useEffect, useRef, useCallback }  from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import AxiosInstance from './axiosInstance';
import BotonInscripcion from './BotonInscripcion';
import CommentTree from './CommentTree';
import { Box, Typography, TextField, Divider, CircularProgress } from '@mui/material';
const VerEvento = () => {
    const [evento, setEvento] = useState(null);
    const [imagenes, setImagenes] = useState([]);
    const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
    const [myData, setMyData] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    const [comments, setComments] = useState([]);
    const [nextPage, setNextPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingComments, setLoadingComments] = useState(false);

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
            const response = await AxiosInstance.get('categories/');
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
                const response = await AxiosInstance.get(`/comments/?evento=${id}&page=${nextPage}`);
                setComments(prev => {
                    const existingIds = new Set(prev.map(c => c.id));
                    const newComments = response.data.results.filter(c => !existingIds.has(c.id));
                    return [...prev, ...newComments];
                });
                setHasMore(response.data.next !== null);
                setNextPage(prev => prev + 1);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingComments(false);
            }
    }, [id, nextPage, hasMore, loadingComments]);

    const reloadComments = async () => {
        try {
            const response = await AxiosInstance.get(`/comments/?evento=${id}&page=1`);
            setComments(response.data.results);
            setNextPage(2);
            setHasMore(response.data.next !== null);
        } catch (error) {
            console.error(error);
        }
    };


    const handleReply = async (parentId, content) => {
        try {
            await AxiosInstance.post('/comments/', {
                evento: id, 
                content,
                parent: parentId
            });
            await reloadComments();
        } catch (error) {
            console.error(error);
        }
    };
    

    const handleNewComment = async () => {
        if (!newCommentContent.trim()) return;
        try {
            await AxiosInstance.post('/comments/', {
                evento: id,
                content: newCommentContent
            });
            setNewCommentContent('');
            await reloadComments();
        } catch (error) {
            console.error(error);
        }
    };
    

    const [newCommentContent, setNewCommentContent] = useState('');

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


    // Intersection Observer to trigger load
    const observer = useRef();
    const lastCommentRef = useCallback(
        node => {
            if (loadingComments) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(entries => {
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
            navigate('/home');
        } else {
            navigate('/login');
        }
    };

    if (!evento || !myData) {
        return <div>Cargando...</div>;
    }

    const yaInscrito = evento.participants.includes(myData.email);
    const estaLleno = evento.participants.length >= (evento.max_participants || evento.limite_asistentes || 0);

    return (
        <div style={styles.container}>
            <Button
                onClick={handleRedirect}
                style={{
                    width: '10%',
                    marginLeft: '8%',
                    padding: '15px',
                    backgroundColor: '#007BFF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                }}
            >
                {isAuthenticated ? 'Ir al Inicio' : 'Ir al Login'}
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={styles.title}>
                    {evento.title}
                </h2>
                <BotonInscripcion
                    eventId={evento.id}
                    yaInscrito={yaInscrito}
                    estaLleno={estaLleno}
                    onCambio={fetchEvento}
                    style={{ marginLeft: '20px' }}
                />
            </div>
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Información</h3>
                <p><strong>Lugar:</strong> {evento.location}</p>
                <p><strong>Fecha:</strong> {new Date(evento.event_date).toISOString().split("T")[0]}</p>
                <p><strong>Categoría:</strong> {categoriasDisponibles.find(cat => cat.id === evento.category)?.name || 'Sin categoría'}</p>
                <p><strong>Creador del Evento:</strong> {evento.author_username}</p>
                <p><strong>Participantes:</strong> {evento.participants.length}/{evento.max_participants}</p>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Sobre el Evento + Imagenes del Evento</h3>
                <p>{evento.description}</p>
                <div style={styles.imageContainer}>
                    {imagenes.map((img, idx) => (
                        <div key={idx} style={styles.imageWrapper}>
                            <img
                                src={img.url}
                                alt={`imagen-${idx}`}
                                style={styles.image}
                            />
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

<Box sx={{ mt: 4 }}>
    <Typography variant="h5" gutterBottom>
        Comentarios
    </Typography>

    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <TextField
            label="Escribe un comentario..."
            multiline
            minRows={3}
            variant="outlined"
            value={newCommentContent}
            onChange={e => setNewCommentContent(e.target.value)}
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
                    <Box key={comment.id} ref={lastCommentRef} sx={{ mb: 2 }}>
                        <CommentTree comment={comment} onReply={handleReply} />
                        <Divider sx={{ my: 1 }} />
                    </Box>
                );
            } else {
                return (
                    <Box key={comment.id} sx={{ mb: 2 }}>
                        <CommentTree comment={comment} onReply={handleReply} />
                        <Divider sx={{ my: 1 }} />
                    </Box>
                );
            }
        })
    )}

    {loadingComments && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress />
        </Box>
    )}
</Box>


        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        fontSize: '28px',
        color: '#333',
        marginBottom: '20px',
    },
    section: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        marginBottom: '20px',
    },
    sectionTitle: {
        fontSize: '20px',
        marginBottom: '10px',
        color: '#333',
    },
    imageContainer: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    imageWrapper: {
        textAlign: 'center',
    },
    image: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
};

export default VerEvento;
