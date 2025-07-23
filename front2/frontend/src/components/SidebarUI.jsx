import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Button,
  Tabs,
  Tab,
  Popover,
  Typography,
  Badge,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import ExploreIcon from "@mui/icons-material/Explore";
import InfoIcon from "@mui/icons-material/Info";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationDropdown from "./NotificationDropdown";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FlagCircleIcon from "@mui/icons-material/FlagCircle";

import { useLocation, Link } from "react-router-dom";

const SidebarUI = ({
  profilePicture,
  user,
  handleCrearEvento,
  handleLogoutClick,
  handleNotifClick,
  notifAnchorRef,
  notifications,
  tabValue,
  setTabValue,
  showNotifPopover,
  handleNotifClose,
  unreadCount,
}) => {
  const location = useLocation();
  const path = location.pathname;
  console.log("Usuario logeado:", user);

  const navItems = [
    { label: "Inicio", icon: <HomeIcon />, path: "/home" },
    { label: "Explorar", icon: <ExploreIcon />, path: "/buscar" },
    {
      label: "Notificaciones",
      icon: <NotificationsIcon />,
      path: "#notificaciones",
    },
    { label: "Mi Perfil", icon: <AccountCircleIcon />, path: "/perfil" },
    { label: "Sobre", icon: <InfoIcon />, path: "/about" },
  ];

  // Si el usuario es admin, añade ítems especiales
  if (user?.is_staff || user?.is_superuser) {
    navItems.push(
      {
        label: "Usuarios",
        icon: <AdminPanelSettingsIcon />,
        path: "/admin-users",
      },
      { label: "Reportes", icon: <FlagCircleIcon />, path: "/admin-reports" }
    );
  }

  const hasUnreadEventos = notifications.some(
    (n) => !n.is_read && n.notification_type === "evento"
  );
  const hasUnreadComentarios = notifications.some(
    (n) => !n.is_read && n.notification_type === "comentario"
  );
  const hasUnreadSeguidores = notifications.some(
    (n) => !n.is_read && n.notification_type === "seguimiento"
  );

  return (
    <Box
      sx={{
        height: "100vh",
        pt: 2,
        px: 1,
        display: "flex",
        flexDirection: "column",
        width: 260,
        borderRight: "1px solid #e0e0e0",
        backgroundColor: "#fff",
        justifyContent: "space-between",
        position: "relative",
      }}
    >
      {/* Sección superior */}
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            px: 2,
            pb: 2,
            fontSize: "1.25rem",
            color: "#1a1a1a",
          }}
        >
          Plataforma
        </Typography>

        <List>
          {navItems.map((item) => {
            const isNotif = item.label === "Notificaciones";
            const showBadge = isNotif && unreadCount > 0;

            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={item.path.startsWith("/") ? Link : "button"}
                  to={item.path.startsWith("/") ? item.path : undefined}
                  onClick={isNotif ? handleNotifClick : undefined}
                  selected={path === item.path}
                  sx={{
                    borderRadius: "50px",
                    px: 2,
                    py: 1.2,
                    "&.Mui-selected": {
                      backgroundColor: "#e8f0fe",
                      color: "#1a73e8",
                      fontWeight: 600,
                    },
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: "#555" }}>
                    {showBadge ? (
                      <Badge
                        badgeContent={unreadCount}
                        color="error"
                        overlap="circular"
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: "1rem",
                      fontWeight: path === item.path ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Botón crear evento */}
        <Box sx={{ px: 2, mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleCrearEvento}
            startIcon={<AddIcon />}
            sx={{
              borderRadius: "50px",
              width: "100%",
              backgroundColor: "#1a73e8",
              textTransform: "none",
              fontWeight: 600,
              py: 1.2,
              fontSize: "1rem",
              boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.1)",
            }}
          >
            Crear evento
          </Button>
        </Box>

        {/* Ancla invisible para Popover */}
        <div
          ref={notifAnchorRef}
          style={{
            position: "fixed",
            top: "150px",
            left: "610px",
            width: "0px",
            height: "0px",
            zIndex: 1300,
          }}
        />

        {/* Popover de notificaciones */}
        <NotificationDropdown
          anchorEl={notifAnchorRef.current}
          open={showNotifPopover}
          onClose={handleNotifClose}
          tabValue={tabValue}
          setTabValue={setTabValue}
        />
      </Box>

      {/* Sección fija inferior: perfil + logout */}
      <Box
        sx={{
          px: 2,
          pb: 2,
          pt: 2,
          borderTop: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar src={profilePicture} sx={{ width: 42, height: 42 }} />
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {user?.full_name || "Usuario"}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666" }}>
              @{user?.username || "username"}
            </Typography>
          </Box>
        </Box>

        <Button
          onClick={handleLogoutClick}
          startIcon={<LogoutIcon />}
          sx={{
            mt: 1,
            alignSelf: "flex-start",
            fontSize: "0.875rem",
            textTransform: "none",
            color: "#444",
            borderRadius: "6px",
            px: 1.5,
            py: 0.75,
            backgroundColor: "#f5f5f5",
            "&:hover": {
              backgroundColor: "#e0e0e0",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default SidebarUI;
