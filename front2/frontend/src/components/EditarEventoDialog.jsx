import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, FormControl, InputLabel, Select, MenuItem, Alert, Box, Typography
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import "./VerEvento.css";






const EditarEventoDialog = ({
    open, onClose, editData, onChange, onSubmit, loading, error, categorias,
    imagenesExistentes = [], setImagenesExistentes = () => {},
    imagenesNuevas = [], setImagenesNuevas = () => {},

    }) => {


            // Agregar nuevas imágenes
        const handleImagenes = (e) => {
            const files = Array.from(e.target.files);
            setImagenesNuevas(prev => [...prev, ...files]);
        };

        // Eliminar imagen existente
        const handleEliminarExistente = (id) => {
            setImagenesExistentes(prev => prev.filter(img => img.id !== id));
        };

        // Eliminar imagen nueva
        const handleEliminarNueva = (index) => {
            setImagenesNuevas(prev => prev.filter((_, idx) => idx !== index));
        };

        // Reordenar imágenes existentes
        const handleReordenarExistente = (fromIndex, toIndex) => {
            const updated = [...imagenesExistentes];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);
            setImagenesExistentes(updated);
        };

        // Reordenar imágenes nuevas
        const handleReordenarNueva = (fromIndex, toIndex) => {
            const updated = [...imagenesNuevas];
            const [moved] = updated.splice(fromIndex, 1);
            updated.splice(toIndex, 0, moved);
            setImagenesNuevas(updated);
        };




        return (
            <>
                {/* tu Dialog completo */}
                <Dialog 
                open={open} 
                onClose={onClose} 
                fullWidth 
                maxWidth="md"
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
                    pb: 2,
                    pt: 3,
                    fontSize: '1.4rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, rgba(25, 118, 210, 1) 0%, #42a5f5 100%)',
                    color: 'white',
                    position: 'relative',
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px'
                }}>
                    Editar Evento
                </DialogTitle>
                
                <DialogContent sx={{ pt: 2, pb: 2, px: 3 }}>
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 3,
                                mt: 6,
                                borderRadius: 2,
                                '& .MuiAlert-message': {
                                    fontSize: '0.95rem'
                                }
                            }}
                        >
                            {error}
                        </Alert>
                    )}
                    
                    <Box sx={{ display: 'grid', gap: 2.5, mt: error ? 0 : 3 }}>
                        {/* Título del evento */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ 
                                mb: 1, 
                                color: '#1976d2', 
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}>
                                📝 Título del Evento
                            </Typography>
                            <TextField
                                name="title"
                                value={editData.title}
                                onChange={onChange}
                                fullWidth
                                placeholder="Ingresa el título del evento"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: '#1976d2',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1976d2',
                                        }
                                    }
                                }}
                            />
                        </Box>
        
                        {/* Descripción */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ 
                                mb: 1, 
                                color: '#1976d2', 
                                fontWeight: 600,
                                fontSize: '0.9rem'
                            }}>
                                📄 Descripción
                            </Typography>
                            <TextField
                                name="description"
                                value={editData.description}
                                onChange={onChange}
                                fullWidth
                                multiline
                                minRows={3}
                                placeholder="Describe tu evento..."
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        '&:hover fieldset': {
                                            borderColor: '#1976d2',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#1976d2',
                                        }
                                    }
                                }}
                            />
                        </Box>
        
                        {/* Fecha y Ubicación en grid */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ 
                                    mb: 1, 
                                    color: '#1976d2', 
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}>
                                    📅 Fecha y Hora
                                </Typography>
                                <TextField
                                    name="event_date"
                                    type="datetime-local"
                                    value={editData.event_date}
                                    onChange={onChange}
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#1976d2',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1976d2',
                                            }
                                        }
                                    }}
                                />
                            </Box>
        
                            <Box>
                                <Typography variant="subtitle2" sx={{ 
                                    mb: 1, 
                                    color: '#1976d2', 
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}>
                                    📍 Ubicación
                                </Typography>
                                <TextField
                                    name="location"
                                    value={editData.location}
                                    onChange={onChange}
                                    fullWidth
                                    placeholder="¿Dónde será el evento?"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#1976d2',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1976d2',
                                            }
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
        
                        {/* Categoría y Participantes en grid */}
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <Box>
                                <Typography variant="subtitle2" sx={{ 
                                    mb: 1, 
                                    color: '#1976d2', 
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}>
                                    🏷️ Categoría
                                </Typography>
                                <FormControl fullWidth>
                                    <Select
                                        name="category"
                                        value={editData.category}
                                        onChange={onChange}
                                        displayEmpty
                                        sx={{
                                            borderRadius: 2,
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#1976d2',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#1976d2',
                                            }
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            <em style={{ color: '#999' }}>Selecciona una categoría</em>
                                        </MenuItem>
                                        {categorias.map(cat => (
                                            <MenuItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
        
                            <Box>
                                <Typography variant="subtitle2" sx={{ 
                                    mb: 1,  
                                    color: '#1976d2', 
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}>
                                    👥 Máximo de Participantes
                                </Typography>
                                <TextField
                                    name="max_participants"
                                    type="number"
                                    value={editData.max_participants}
                                    onChange={onChange}
                                    fullWidth
                                    placeholder="Límite de asistentes"
                                    inputProps={{ min: 1, max: 1000 }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            '&:hover fieldset': {
                                                borderColor: '#1976d2',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1976d2',
                                            }
                                        }
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
        
        <Box>
     
           
        
    <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{
            mb: 1,
            color: '#1976d2',
            fontWeight: 600,
            fontSize: '0.9rem'
        }}>
            🖼️ Imágenes del Evento
        </Typography>

        <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagenes}
        />

            <Box sx={{
                mt: 2,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'center'
            }}>
            {[...imagenesExistentes, ...imagenesNuevas.map((file, idx) => ({
                id: `new-${idx}`,
                url: URL.createObjectURL(file),
                isNew: true,
                idx
            }))].map((img, idx) => (
            <Box key={img.id} sx={{
                width: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5,
                position: 'relative'
            }}>
                <img
                    src={img.url}
                    alt={`img-${idx}`}
                    style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #eee'
                    }}
                />

                {/* Controles de orden abajo */}
                <Box sx={{
                    display: 'flex',
                    gap: 0.5,
                    justifyContent: 'center'
                }}>
                    {idx > 0 && (
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => img.isNew
                                ? handleReordenarNueva(img.idx, img.idx - 1)
                                : handleReordenarExistente(idx, idx - 1)
                            }
                            sx={{ minWidth: '30px', p: 0 }}
                        >←</Button>
                    )}
                    {idx < imagenesExistentes.length + imagenesNuevas.length - 1 && (
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => img.isNew
                                ? handleReordenarNueva(img.idx, img.idx + 1)
                                : handleReordenarExistente(idx, idx + 1)
                            }
                            sx={{ minWidth: '30px', p: 0 }}
                        >→</Button>
                    )}
                </Box>

                {/* Botón eliminar si quieres mantenerlo visible */}
                {true && (
                    <Button
                        onClick={() => img.isNew
                            ? handleEliminarNueva(img.idx)
                            : handleEliminarExistente(img.id)
                        }
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 4, right: 4,
                            minWidth: '24px',
                            height: '24px',
                            fontSize: '0.7rem',
                            bgcolor: '#fff',
                            backgroundColor: '#f8f9fa',
                            color: '#f00',
                            '&:hover': { bgcolor: '#fee' }
                        }}
                    >X</Button>
                )}
            </Box>
        ))}
    </Box>
</Box>




        </Box>
        
                
                <DialogActions sx={{ 
                    px: 3, 
                    pb: 3, 
                    pt: 1,
                    justifyContent: 'center',
                    gap: 2,
                    background: 'linear-gradient(180deg, transparent 0%, #f8f9fa 100%)',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px'
                }}>
                    <Button 
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            borderRadius: '25px',
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
                        onClick={onSubmit}
                        variant="contained"
                        disabled={loading}
                        sx={{
                            borderRadius: '25px',
                            px: 3,
                            py: 1,
                            textTransform: 'none',
                            fontWeight: 600,
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
                        {loading ? '💾 Guardando...' : '💾 Guardar Cambios'}
                    </Button>
                </DialogActions>
            </Dialog>
            </>
        );






    }


    
    

export default EditarEventoDialog;