import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/Logout";
import FlagIcon from "@mui/icons-material/Flag";
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

import { useTheme, useMediaQuery } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AxiosInstance from "./axiosInstance";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { isSameDay } from "date-fns";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";

import SidebarUI from "./SidebarUI";
import defaultAvatar from "../assets/default-avatar.jpg";

const drawerWidth = 260;
const widgetWidth = 400;

export default function Navbar({ content }) {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const notifAnchorRef = useRef(null);

  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [notifications, setNotifications] = useState([]);
  const [anchorNotif, setAnchorNotif] = useState(null);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [profilePicture, setProfilePicture] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [userData, setUserData] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNotifClick = () => {
    setAnchorNotif(notifAnchorRef.current);
    setShowNotifPopover(true);
    markAllAsRead();
  };

  const handleNotifClose = () => {
    setAnchorNotif(null);
    setShowNotifPopover(false);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const res = await AxiosInstance.get("/users/ver_perfil/");
        setProfilePicture(
          res.data.profile_picture
            ? res.data.profile_picture
            : defaultAvatar
        );
        setUserData(res.data);
      } catch (error) {
        console.error("Error al obtener datos de usuario:", error);
        setProfilePicture(null);
      }
    };
    fetchProfilePicture();
  }, []);

  const handleCrearEvento = () => navigate("/crear-evento");
  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
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
          <>
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
          </>
        )}
      </List>
      <Divider />
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <CssBaseline />

      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
              backgroundColor: "#fff",
              borderRight: "1px solid #e0e0e0",
            },
          }}
        >
          <SidebarUI
            profilePicture={profilePicture}
            user={userData}
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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflowY: "auto",
          padding: 3,
          backgroundColor: "#f9f9f9",
        }}
      >
        {content}
      </Box>

      {!isMobile && (
        <Box
          sx={{
            width: widgetWidth,
            height: "100vh",
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
            <DateCalendar slots={{ day: CustomDay }} />
          </LocalizationProvider>
        </Box>
      )}
    </Box>
  );
}
