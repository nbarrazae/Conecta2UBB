import React, { useState, useEffect } from "react";
import {
  Popover,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Avatar,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AxiosInstance from "./axiosInstance";

const NotificationDropdown = ({
  anchorEl,
  open,
  onClose,
  tabValue,
  setTabValue,
}) => {
  const [notifications, setNotifications] = useState([]);

  // Obtener notificaciones del backend
  const fetchNotifications = async () => {
    try {
      const res = await AxiosInstance.get("/notifications/");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error al obtener notificaciones:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const markAllAsRead = async () => {
    try {
      await AxiosInstance.patch("/notifications/mark_all_as_read/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error al marcar como leídas:", error);
    }
  };

  const handleNotificationClick = async (url) => {
    await markAllAsRead();
    onClose();
    window.location.href = url;
  };

  // Cálculos para badges
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const unreadEventCount = notifications.filter(
    (n) => !n.is_read && n.notification_type === "evento"
  ).length;
  const unreadCommentCount = notifications.filter(
    (n) => !n.is_read && n.notification_type === "comentario"
  ).length;
  const unreadFollowCount = notifications.filter(
    (n) => !n.is_read && n.notification_type === "seguimiento"
  ).length;

  // Filtrado según pestaña
  const filteredNotifications = notifications.filter((n) => {
    if (tabValue === 0) return n.notification_type === "evento";
    if (tabValue === 1) return n.notification_type === "comentario";
    if (tabValue === 2) return n.notification_type === "seguimiento";
    return false;
  });

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        elevation: 8,
        sx: { borderRadius: 2, minWidth: 350, mt: 1 },
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        <Typography variant="h6">Notificaciones</Typography>
        {unreadCount > 0 && (
          <Typography variant="caption">{unreadCount} sin leer</Typography>
        )}
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span>Eventos</span>
              {unreadEventCount > 0 && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#ff1744",
                  }}
                />
              )}
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span>Comentarios</span>
              {unreadCommentCount > 0 && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#ff1744",
                  }}
                />
              )}
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span>Seguidores</span>
              {unreadFollowCount > 0 && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#ff1744",
                  }}
                />
              )}
            </Box>
          }
        />
      </Tabs>

      <List dense sx={{ maxHeight: 350, overflow: "auto", width: 350, p: 0 }}>
        {filteredNotifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <NotificationsIcon
              sx={{ fontSize: 48, color: "grey.400", mb: 2 }}
            />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No hay notificaciones
            </Typography>
            <Typography variant="body2" color="text.disabled">
              {tabValue === 0
                ? "No tienes notificaciones de eventos"
                : tabValue === 1
                ? "No tienes notificaciones de comentarios"
                : "No tienes notificaciones de seguidores"}
            </Typography>
          </Box>
        ) : (
          filteredNotifications.map((n) => (
            <ListItem
              key={n.id}
              button
              onClick={() => handleNotificationClick(n.url)}
              sx={{
                py: 1.5,
                px: 2,
                backgroundColor: !n.is_read
                  ? "rgba(25, 118, 210, 0.04)"
                  : "transparent",
                borderLeft: !n.is_read
                  ? "3px solid #1976d2"
                  : "3px solid transparent",
                "&:hover": {
                  backgroundColor: !n.is_read
                    ? "rgba(25, 118, 210, 0.08)"
                    : "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              {n.notification_type === "seguimiento" &&
                n.emisor_profile_picture && (
                  <Avatar
                    src={n.emisor_profile_picture}
                    alt={n.emisor_username}
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                )}
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {!n.is_read && (
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          bgcolor: "#ff1744",
                          flexShrink: 0,
                          boxShadow: "0 0 4px rgba(255, 23, 68, 0.5)",
                        }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: !n.is_read ? 600 : 400 }}
                    >
                      {n.message}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ ml: !n.is_read ? 3.5 : 0 }}
                  >
                    {new Date(n.created_at).toLocaleString("es-ES", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Typography>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Popover>
  );
};

export default NotificationDropdown;
