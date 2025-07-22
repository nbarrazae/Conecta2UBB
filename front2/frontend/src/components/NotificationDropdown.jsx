import React, { useState, useEffect } from 'react';
import {
    IconButton,
    Badge,
    Popover,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    Typography,
    Box
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AxiosInstance from './axiosInstance';

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [anchorNotif, setAnchorNotif] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    // Obtener notificaciones del backend
    const fetchNotifications = async () => {
        try {
            const res = await AxiosInstance.get('/notifications/');
            setNotifications(res.data);
        } catch (err) {
            console.error('Error al obtener notificaciones:', err);
        }
    };

    // Efecto para cargar notificaciones inicialmente y actualizar cada 10 segundos
    useEffect(() => {
        fetchNotifications(); // Carga inicial

        const interval = setInterval(() => {
            fetchNotifications();
        }, 10000); // cada 10 segundos

        return () => clearInterval(interval);
    }, []);

    // Manejar click en el botón de notificaciones
    const handleNotifClick = (event) => {
        setAnchorNotif(event.currentTarget);
        // No marcar como leído inmediatamente
    };

    // Cerrar popover de notificaciones
    const handleNotifClose = () => {
        setAnchorNotif(null);
        // Marcar como leídas cuando se cierra el dropdown (solo si se cierra naturalmente)
        markAllAsRead();
    };

    // Marcar todas las notificaciones como leídas
    const markAllAsRead = async () => {
        try {
            await AxiosInstance.patch('/notifications/mark_all_as_read/');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error("Error al marcar como leídas:", error);
        }
    };

    // Cambiar tab activo
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Manejar click en una notificación
    const handleNotificationClick = async (url) => {
        // Marcar todas como leídas antes de navegar
        await markAllAsRead();
        // Cerrar el dropdown
        setAnchorNotif(null);
        // Navegar a la URL
        window.location.href = url;
    };

    // Contar notificaciones no leídas
    const unreadCount = notifications.filter(n => !n.is_read).length;
    
    // Contar notificaciones sin leer por tipo
    const unreadEventCount = notifications.filter(n => !n.is_read && n.notification_type === 'evento').length;
    const unreadCommentCount = notifications.filter(n => !n.is_read && n.notification_type === 'comentario').length;

    // Filtrar notificaciones según el tab activo
    const filteredNotifications = notifications.filter(n => 
        tabValue === 0 ? n.notification_type === 'evento' : n.notification_type === 'comentario'
    );

    return (
        <>
            <IconButton color="inherit" onClick={handleNotifClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Popover
                open={Boolean(anchorNotif)}
                anchorEl={anchorNotif}
                onClose={handleNotifClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                    elevation: 8,
                    sx: {
                        borderRadius: 2,
                        minWidth: 350,
                        mt: 1
                    }
                }}
            >
                {/* Header simple */}
                <Box sx={{ 
                    p: 2, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    bgcolor: 'primary.main',
                    color: 'white'
                }}>
                    <Typography variant="h6">
                        Notificaciones
                    </Typography>
                    {unreadCount > 0 && (
                        <Typography variant="caption">
                            {unreadCount} sin leer
                        </Typography>
                    )}
                </Box>

                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                >
                    <Tab 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>Eventos</span>
                                {unreadEventCount > 0 && (
                                    <Box sx={{ 
                                        width: 8, 
                                        height: 8, 
                                        borderRadius: '50%', 
                                        bgcolor: '#ff1744',
                                        flexShrink: 0
                                    }} />
                                )}
                            </Box>
                        }
                    />
                    <Tab 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>Comentarios</span>
                                {unreadCommentCount > 0 && (
                                    <Box sx={{ 
                                        width: 8, 
                                        height: 8, 
                                        borderRadius: '50%', 
                                        bgcolor: '#ff1744',
                                        flexShrink: 0
                                    }} />
                                )}
                            </Box>
                        }
                    />
                </Tabs>

                <List dense sx={{ maxHeight: 350, overflow: 'auto', width: 350, p: 0 }}>
                    {filteredNotifications.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <NotificationsIcon sx={{ 
                                fontSize: 48, 
                                color: 'grey.400', 
                                mb: 2 
                            }} />
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                No hay notificaciones
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                                {tabValue === 0 ? "No tienes notificaciones de eventos" : "No tienes notificaciones de comentarios"}
                            </Typography>
                        </Box>
                    ) : (
                        filteredNotifications.map(notification => (
                            <ListItem
                                key={notification.id}
                                button
                                onClick={() => handleNotificationClick(notification.url)}
                                sx={{
                                    py: 1.5,
                                    px: 2,
                                    backgroundColor: !notification.is_read ? 'rgba(25, 118, 210, 0.04)' : 'transparent',
                                    borderLeft: !notification.is_read ? '3px solid #1976d2' : '3px solid transparent',
                                    '&:hover': {
                                        backgroundColor: !notification.is_read ? 'rgba(25, 118, 210, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {!notification.is_read && (
                                                <Box sx={{ 
                                                    width: 12, 
                                                    height: 12, 
                                                    borderRadius: '50%', 
                                                    bgcolor: '#ff1744',
                                                    flexShrink: 0,
                                                    boxShadow: '0 0 4px rgba(255, 23, 68, 0.5)'
                                                }} />
                                            )}
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: !notification.is_read ? 600 : 400,
                                                    color: !notification.is_read ? 'text.primary' : 'text.secondary'
                                                }}
                                            >
                                                {notification.message}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.disabled" sx={{ ml: !notification.is_read ? 3.5 : 0 }}>
                                            {new Date(notification.created_at).toLocaleString('es-ES', { 
                                                day: 'numeric', 
                                                month: 'short', 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </Typography>
                                    }
                                />
                                {!notification.is_read && (
                                    <Box sx={{ 
                                        width: 6, 
                                        height: 6, 
                                        borderRadius: '50%', 
                                        bgcolor: '#1976d2',
                                        ml: 1,
                                        flexShrink: 0
                                    }} />
                                )}
                            </ListItem>
                        ))
                    )}
                </List>
            </Popover>
        </>
    );
};

export default NotificationDropdown;
