import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';

const EditarEventoDialog = ({
    open, onClose, editData, onChange, onSubmit, loading, error, categorias
}) => (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Editar Evento</DialogTitle>
        <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
                margin="dense"
                label="Título"
                name="title"
                value={editData.title}
                onChange={onChange}
                fullWidth
            />
            <TextField
                margin="dense"
                label="Descripción"
                name="description"
                value={editData.description}
                onChange={onChange}
                fullWidth
                multiline
                minRows={3}
            />
            <TextField
                margin="dense"
                label="Fecha y hora"
                name="event_date"
                type="datetime-local"
                value={editData.event_date}
                onChange={onChange}
                fullWidth
            />
            <TextField
                margin="dense"
                label="Lugar"
                name="location"
                value={editData.location}
                onChange={onChange}
                fullWidth
            />
            <FormControl fullWidth margin="dense">
                <InputLabel>Categoría</InputLabel>
                <Select
                    name="category"
                    value={editData.category}
                    label="Categoría"
                    onChange={onChange}
                >
                    {categorias.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <TextField
                margin="dense"
                label="Máximo de participantes"
                name="max_participants"
                type="number"
                value={editData.max_participants}
                onChange={onChange}
                fullWidth
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button
                onClick={onSubmit}
                variant="contained"
                color="primary"
                disabled={loading}
            >
                Guardar Cambios
            </Button>
        </DialogActions>
    </Dialog>
);

export default EditarEventoDialog;