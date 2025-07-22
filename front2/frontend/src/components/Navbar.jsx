import * as React from "react";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/Logout";
import FlagIcon from "@mui/icons-material/Flag";
import { useTheme, useMediaQuery } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AxiosInstance from "./axiosInstance";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import Fab from "@mui/material/Fab";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Person2Icon from "@mui/icons-material/Person2";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Tooltip from "@mui/material/Tooltip";

import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { isSameDay } from "date-fns";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { useRef } from "react"; // si aún no lo tienes
import SidebarUI from "./SidebarUI";

const drawerWidth = 240;
const widgetWidth = 400;

export default function Navbar({ content }) {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const notifAnchorRef = useRef(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const [profilePicture, setProfilePicture] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [notifications, setNotifications] = useState([]);
  const [anchorNotif, setAnchorNotif] = useState(null);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  const [tabValue, setTabValue] = useState(0);

  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const fetchUpcomingEvents = async () => {
    try {
      const res = await AxiosInstance.get("/eventos/upcoming/");
      setUpcomingEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const CustomDay = ({ day, outsideCurrentMonth, ...other }) => {
    const hasEvent = upcomingEvents.some((event) =>
      isSameDay(new Date(event.fecha_limite), day)
    );

    return (
      <Badge
        overlap="circular"
        color="primary"
        variant={hasEvent ? "dot" : "standard"}
      >
        <PickersDay
          day={day}
          outsideCurrentMonth={outsideCurrentMonth}
          {...other}
        />
      </Badge>
    );
  };

  const fetchNotifications = async () => {
    try {
      const res = await AxiosInstance.get("/notifications/");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications(); // inicial

    const interval = setInterval(() => {
      fetchNotifications();
    }, 10000); // cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const handleNotifClick = () => {
    setAnchorNotif(notifAnchorRef.current); // ancla al lado derecho
    setShowNotifPopover(true); // muestra popover
    markAllAsRead();
  };

  const handleNotifClose = () => {
    setAnchorNotif(null);
    setShowNotifPopover(false); // lo oculta
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const res = await AxiosInstance.get("/users/ver_perfil/");
        if (res.data.profile_picture) {
          setProfilePicture(`http://localhost:8000${res.data.profile_picture}`);
        } else {
          setProfilePicture(defaultAvatar);
        }
      } catch (error) {
        console.error("Error al obtener imagen de perfil:", error);
        setProfilePicture(defaultAvatar);
      }
    };

    fetchProfilePicture();
  }, []);

  const handleCrearEvento = () => {
    navigate("/crear-evento");
  };

  const handleNotificaciones = () => {
    navigate("/notificaciones"); // O ruta que utilices
  };

  const handlePerfil = () => {
    navigate("/perfil");
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePerfilClick = () => {
    navigate("/perfil");
    handleMenuClose();
  };

  const handleLogoutClick = () => {
    AxiosInstance.post(`logoutall/`, {}).then(() => {
      localStorage.removeItem("Token");
      navigate("/login");
    });
    handleMenuClose();
  };

  const markAllAsRead = async () => {
    try {
      await AxiosInstance.patch("/notifications/mark_all_as_read/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error al marcar como leídas:", error);
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openWidgets, setOpenWidgets] = React.useState(false);

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const logoutUser = () => {
    AxiosInstance.post(`logoutall/`, {}).then(() => {
      localStorage.removeItem("Token");
      navigate("/login");
    });
  };

  const [userData, setUserData] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await AxiosInstance.get("/users/ver_perfil/");
        setUserData(res.data);
      } catch (err) {
        console.error("Error al obtener datos del usuario:", err);
      }
    };

    fetchUserData();
  }, []);

  const isAdmin = !!(userData && (userData.is_staff || userData.is_superuser));

  const drawerContent = (
    <Box sx={{ overflow: "auto" }}>
      <Toolbar />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/home"
            selected={path === "/home"}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Principal" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/about"
            selected={path === "/about"}
          >
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="About" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/buscar"
            selected={path === "/buscar"}
          >
            <ListItemIcon>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText primary="Buscar" />
          </ListItemButton>
        </ListItem>

        {isAdmin && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/admin-users"
              selected={path === "/admin-users"}
            >
              <ListItemIcon>
                <Person2Icon />
              </ListItemIcon>
              <ListItemText primary="Gestionar Usuarios" />
            </ListItemButton>
          </ListItem>
        )}

        {isAdmin && (
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/admin-reports"
              selected={path === "/admin-reports"}
            >
              <ListItemIcon>
                <FlagIcon />
              </ListItemIcon>
              <ListItemText primary="Gestionar Reportes" />
            </ListItemButton>
          </ListItem>
        )}

        {/* <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/perfil"
            selected={path === "/perfil"}
          >
            <ListItemIcon>
              <Person2Icon />
            </ListItemIcon>
            <ListItemText primary="Mi Perfil" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={logoutUser}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem> */}
      </List>
      <Divider />
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100vh", // ✅ ocupa alto total de pantalla
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <CssBaseline />

      {/* 🟦 Sidebar izquierda (Drawer) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 260,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: 260,
              boxSizing: "border-box",
              backgroundColor: "#fff",
              borderRight: "1px solid #e0e0e0",
            },
          }}
        >
          <SidebarUI
            profilePicture={profilePicture}
            user={userData} // 🔹 nuevo
            handleCrearEvento={handleCrearEvento}
            handleAvatarClick={handleAvatarClick}
            anchorEl={anchorEl}
            open={open}
            handleMenuClose={handleMenuClose}
            handlePerfilClick={handlePerfilClick}
            handleLogoutClick={handleLogoutClick}
            handleNotifClick={handleNotifClick}
            anchorNotif={anchorNotif}
            handleNotifClose={handleNotifClose}
            notifications={notifications}
            unreadCount={unreadCount}
            tabValue={tabValue}
            setTabValue={setTabValue}
            notifAnchorRef={notifAnchorRef}
            showNotifPopover={showNotifPopover}
          />
        </Drawer>
      )}

      {/* 🟨 Contenido central */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh", // ✅ se asegura de ocupar todo el alto
          overflowY: "auto",
          padding: 3,
          backgroundColor: "#f9f9f9",
        }}
      >
        {content}
      </Box>

      {/* 🟥 Sidebar derecha */}
      {!isMobile && (
        <Box
          sx={{
            width: widgetWidth,
            height: "100vh", // ✅ full height
            overflowY: "auto",
            borderLeft: "1px solid #ddd",
            backgroundColor: "#fafafa",
            padding: 2,
          }}
        >
          <Typography variant="h6">Recordatorios</Typography>
          {upcomingEvents.length === 0 ? (
            <Typography variant="body2" sx={{ mb: 2 }}>
              No tienes eventos próximos.
            </Typography>
          ) : (
            <List dense>
              {upcomingEvents.map((event) => (
                <ListItem
                  key={event.id}
                  button
                  onClick={() => navigate(`/ver-evento/${event.id}`)}
                >
                  <ListItemText
                    primary={event.titulo}
                    secondary={`Límite: ${new Date(
                      event.fecha_limite
                    ).toLocaleString()}`}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Typography variant="h6" sx={{ mt: 2 }}>
            Calendario
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateCalendar
              slots={{
                day: CustomDay,
              }}
            />
          </LocalizationProvider>
        </Box>
      )}
    </Box>
  );
}
