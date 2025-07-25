import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, TextField, FormControl,
    InputLabel, Select, MenuItem, Alert, Card, CardContent,
    Snackbar, IconButton
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon, Close as CloseIcon } from '@mui/icons-material';
import AxiosInstance from './axiosInstance';

const CrearEvento = () => {
    const [imagenes, setImagenes] = useState([]);
    const [nombre, setNombre] = useState("");
    const [categoria, setCategoria] = useState("");
    const [lugar, setLugar] = useState("");
    const [fecha, setFecha] = useState("");
    const [max_participants, setLimiteAsistentes] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);

    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem("Token");

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await AxiosInstance.get('categories/');
                setCategoriasDisponibles(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategorias();
    }, []);

    const handleRedirect = () => {
        navigate(isAuthenticated ? '/home' : '/login');
    };

    const handleImagenes = (e) => {
        const files = Array.from(e.target.files);
        setImagenes((prev) => [...prev, ...files]);
    };

    const handleReordenar = (fromIndex, toIndex) => {
        const newOrden = [...imagenes];
        const [moved] = newOrden.splice(fromIndex, 1);
        newOrden.splice(toIndex, 0, moved);
        setImagenes(newOrden);
    };

    const handleEliminarImagen = (index) => {
        setImagenes((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("title", nombre);
            formData.append("category", categoria);
            formData.append("location", lugar);
            formData.append("event_date", fecha);
            formData.append("description", descripcion);
            formData.append("max_participants", max_participants);

            console.log("formData:", formData);
            imagenes.forEach((img, index) => {
                formData.append("imagenes", img);
                formData.append(`orden_${index}`, index);
            });

            await AxiosInstance.post("eventos/", formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSuccessOpen(true);
            setTimeout(() => navigate('/home'), 2000);
        } catch (err) {
            setError("Ocurrió un error al crear el evento. Por favor intenta nuevamente.");
            console.error("Error creating event:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSuccess = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSuccessOpen(false);
    };

    const action = (
        <React.Fragment>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleCloseSuccess}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </React.Fragment>
    );

    return (
        <Box sx={{
            maxWidth: '800px',
            margin: '40px auto',
            padding: { xs: 2, md: 4 },
        }}>
            <Card sx={{
                borderRadius: 3,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                overflow: 'visible'
            }}>
                <Box sx={{
                    background: 'linear-gradient(135deg, rgba(25, 118, 210, 1) 0%, #42a5f5 100%)',
                    color: 'white',
                    py: 3,
                    px: 4,
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Crear Nuevo Evento
                    </Typography>
                    <Button
                        onClick={handleRedirect}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.3)',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                        variant="outlined"
                    >
                        {isAuthenticated ? 'Volver al Inicio' : 'Ir al Login'}
                    </Button>
                </Box>

                <CardContent sx={{ pt: 3, pb: 1, px: 4 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 3 }}>
                        {/* Sección de Información Básica */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ 
                                mb: 2, 
                                color: '#1976d2', 
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                📝 Información del Evento
                            </Typography>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 2 }}>
                                <TextField
                                    label="Nombre del Evento"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />

                                <TextField
                                    label="Lugar"
                                    value={lugar}
                                    onChange={(e) => setLugar(e.target.value)}
                                    required
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 2, mt: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel id="categoria-label">Categoría</InputLabel>
                                    <Select
                                        labelId="categoria-label"
                                        label="Categoría"
                                        value={categoria}
                                        onChange={(e) => setCategoria(e.target.value)}
                                        required
                                        sx={{
                                            borderRadius: 2,
                                        }}
                                    >
                                        {categoriasDisponibles.map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Fecha y Hora"
                                    type="datetime-local"
                                    value={fecha}
                                    onChange={(e) => setFecha(e.target.value)}
                                    required
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <TextField
                                    label="Límite de Asistentes"
                                    type="number"
                                    value={max_participants}
                                    onChange={(e) => setLimiteAsistentes(e.target.value)}
                                    fullWidth
                                    sx={{
                                        maxWidth: '300px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Sección de Descripción */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ 
                                mb: 2, 
                                color: '#1976d2', 
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                📄 Descripción del Evento
                            </Typography>
                            <TextField
                                label="Describe tu evento..."
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                fullWidth
                                multiline
                                rows={4}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                    }
                                }}
                            />
                        </Box>

                        {/* Sección de Imágenes */}
                        <Box>
                            <Typography variant="subtitle1" sx={{ 
                                mb: 2, 
                                color: '#1976d2', 
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                🖼️ Imágenes del Evento
                            </Typography>
                            
                            <Button
                                variant="outlined"
                                component="label"
                                sx={{
                                    borderRadius: 2,
                                    mb: 2
                                }}
                            >
                                Seleccionar Imágenes
                                <input
                                    type="file"
                                    hidden
                                    multiple
                                    accept="image/*"
                                    onChange={handleImagenes}
                                />
                            </Button>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                {imagenes.map((img, idx) => (
                                    <Box key={idx} sx={{ 
                                        position: 'relative',
                                        width: 120,
                                        height: 120,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '1px solid #ddd',
                                        '&:hover .image-actions': {
                                            opacity: 1
                                        }
                                    }}>
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`imagen-${idx}`}
                                            style={{ 
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <Box className="image-actions" sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'rgba(0,0,0,0.5)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-around',
                                            opacity: 0,
                                            transition: 'opacity 0.2s',
                                            color: 'white'
                                        }}>
                                            {idx > 0 && (
                                                <Button 
                                                    onClick={() => handleReordenar(idx, idx - 1)}
                                                    sx={{ 
                                                        minWidth: 0,
                                                        color: 'white',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255,255,255,0.2)'
                                                        }
                                                    }}
                                                >
                                                    ←
                                                </Button>
                                            )}
                                            <Button 
                                                onClick={() => handleEliminarImagen(idx)}
                                                sx={{ 
                                                    minWidth: 0,
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,0.2)'
                                                    }
                                                }}
                                            >
                                                X
                                            </Button>
                                            {idx < imagenes.length - 1 && (
                                                <Button 
                                                    onClick={() => handleReordenar(idx, idx + 1)}
                                                    sx={{ 
                                                        minWidth: 0,
                                                        color: 'white',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(255,255,255,0.2)'
                                                        }
                                                    }}
                                                >
                                                    →
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            mt: 4,
                            mb: 2
                        }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                startIcon={<SaveIcon />}
                                disabled={loading}
                                sx={{
                                    borderRadius: '25px',
                                    px: 4,
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
                                        boxShadow: '0 6px 16px rgba(25, 118, 210, 0.5)',
                                        transform: 'translateY(-1px)'
                                    },
                                    '&:disabled': {
                                        background: '#ccc',
                                        color: '#999'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {loading ? 'Creando Evento...' : 'Publicar Evento'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Snackbar de éxito */}
            <Snackbar
                open={successOpen}
                autoHideDuration={6000}
                onClose={handleCloseSuccess}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{
                    '& .MuiPaper-root': {
                        background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
                        color: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)',
                        padding: '12px 24px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                    }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </Box>
                    <Typography variant="body1">
                        ¡Evento creado exitosamente! Redirigiendo...
                    </Typography>
                    {action}
                </Box>
            </Snackbar>
        </Box>
    );
};

export default CrearEvento;