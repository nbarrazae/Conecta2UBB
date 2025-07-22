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
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Tooltip from '@mui/material/Tooltip';

import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Badge from "@mui/material/Badge";

import NotificationDropdown from "./NotificationDropdown";

import { isSameDay } from 'date-fns';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';


const drawerWidth = 240;
const widgetWidth = 400;

export default function Navbar({ content }) {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  const [profilePicture, setProfilePicture] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [upcomingEvents, setUpcomingEvents] = useState([]);

  const fetchUpcomingEvents = async () => {
      try {
          const res = await AxiosInstance.get('/eventos/upcoming/');
          setUpcomingEvents(res.data);
      } catch (err) {
          console.error(err);
      }
  };
  useEffect(() => {
    fetchUpcomingEvents();
}, []);

const CustomDay = ({ day, outsideCurrentMonth, ...other }) => {
    const hasEvent = upcomingEvents.some(event =>
        isSameDay(new Date(event.fecha_limite), day)
    );

    return (
        <Badge
            overlap="circular"
            color="primary"
            variant={hasEvent ? "dot" : "standard"}
        >
            <PickersDay day={day} outsideCurrentMonth={outsideCurrentMonth} {...other} />
        </Badge>
    );
};

  useEffect(() => {
    const fetchProfilePicture = async () => {
        try {
            const res = await AxiosInstance.get("/users/ver_perfil/");
            if (res.data.profile_picture) {
                setProfilePicture(`http://localhost:8000${res.data.profile_picture}`);
            } else {
                setProfilePicture(null);
            }
        } catch (error) {
            console.error("Error al obtener imagen de perfil:", error);
            setProfilePicture(null);
        }
    };

    fetchProfilePicture();
}, []);


  const handleCrearEvento = () => {
    navigate("/crear-evento");
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

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = !!(user && (user.is_staff || user.is_superuser));

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
    
    <Box sx={{ display: "flex", width: "100vw", overflowX: "hidden" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Plataforma de actividades
          </Typography>

          <IconButton color="inherit" onClick={handleCrearEvento}>
              <AddIcon />
          </IconButton>

          <NotificationDropdown />


          <Tooltip title="Opciones de perfil">
    <IconButton onClick={handleAvatarClick} size="small" sx={{ ml: 1 }}>
        <Avatar
            src={profilePicture}
            alt="Perfil"
            sx={{ width: 36, height: 36 }}
        />
    </IconButton>
</Tooltip>

<Menu
    anchorEl={anchorEl}
    open={open}
    onClose={handleMenuClose}
    onClick={handleMenuClose}
    PaperProps={{
        elevation: 0,
        sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
            },
            '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
            },
        },
    }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
>
    <MenuItem onClick={handlePerfilClick}>
        <Avatar src={profilePicture} /> Mi Perfil
    </MenuItem>
    <MenuItem onClick={handleLogoutClick}>
        <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
    </MenuItem>
</Menu>



{/* <IconButton color="inherit" onClick={handlePerfil}>
    <AccountCircleIcon />
</IconButton> */}


        </Toolbar>
      </AppBar>

      {/* Drawer para escritorio */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Drawer para móviles */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: { width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          minWidth: 0,
        }}
      >
        <Toolbar />
        {content}
      </Box>

      {/* Widgets (solo en pantallas grandes) */}
      {!isMobile && (
        <Box
          sx={{
            width: widgetWidth,
            p: 2,
            top: 64, // debajo del AppBar
            right: 0,
            position: "fixed",
            height: "calc(100vh - 64px)",
            borderLeft: "1px solid #ddd",
            backgroundColor: "#fafafa",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6">Recordatorios</Typography>
          {upcomingEvents.length === 0 ? (
    <Typography variant="body2" sx={{ mb: 2 }}>
        No tienes eventos próximos.
    </Typography>
) : (
    <List dense>
        {upcomingEvents.map(event => (
            <ListItem
                key={event.id}
                button
                onClick={() => navigate(`/ver-evento/${event.id}`)}
            >
                <ListItemText
                    primary={event.titulo}
                    secondary={`Límite: ${new Date(event.fecha_limite).toLocaleString()}`}
                />
            </ListItem>
        ))}
    </List>
)}


          <Typography variant="h6">Calendario</Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
    <DateCalendar
        slots={{
            day: CustomDay
        }}
    />
</LocalizationProvider>
        </Box>
      )}
      {/* Floating button + modal para móviles */}
      {isMobile && (
        <>
          <Fab
            color="primary"
            aria-label="calendar"
            onClick={() => setOpenWidgets(true)}
            sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1300 }}
          >
            <CalendarMonthIcon />
          </Fab>

          <Dialog
            open={openWidgets}
            onClose={() => setOpenWidgets(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Calendario y recordatorios</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1">Recordatorios</Typography>
              {upcomingEvents.length === 0 ? (
    <Typography variant="body2" sx={{ mb: 2 }}>
        No tienes eventos próximos.
    </Typography>
) : (
    <List dense>
        {upcomingEvents.map(event => (
            <ListItem
                key={event.id}
                button
                onClick={() => navigate(`/ver-evento/${event.id}`)}
            >
                <ListItemText
                    primary={event.titulo}
                    secondary={`Límite: ${new Date(event.fecha_limite).toLocaleString()}`}
                />
            </ListItem>
        ))}
    </List>
)}


              <Typography variant="subtitle1">Calendario</Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
    <DateCalendar
        slots={{
            day: CustomDay
        }}
    />
</LocalizationProvider>
            </DialogContent>
          </Dialog>
        </>
      )}
    </Box>
  );
}
