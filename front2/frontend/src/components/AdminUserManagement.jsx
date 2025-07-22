import React, { useEffect, useState } from "react";
import AxiosInstance from "./axiosInstance";
import { Box, Card, CardContent, Typography, Button, Stack, Modal, TextField, Alert, MenuItem, Select, InputLabel, FormControl, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";
import "./AdminUserManagement.css";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    bio: "",
    birthday: "",
    // Si usas imágenes:
    // profile_picture: null,
  });
  const [errorMsg, setErrorMsg] = useState(""); // Nuevo estado para el error
  const [successMsg, setSuccessMsg] = useState(""); // Nuevo estado
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    AxiosInstance.get("/user-admin/")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    AxiosInstance.get("/categories/")
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que quieres eliminar este usuario?")) {
      AxiosInstance.delete(`/user-admin/${id}/`)
        .then(() => setUsers(users.filter(u => u.id !== id)));
    }
  };

  const handleSuspend = (id) => {
    AxiosInstance.patch(`/user-admin/${id}/`, { is_active: false })
      .then(() => setUsers(users.map(u => u.id === id ? { ...u, is_active: false } : u)));
  };

  const handleActivate = (id) => {
    AxiosInstance.patch(`/user-admin/${id}/`, { is_active: true })
      .then(() => setUsers(users.map(u => u.id === id ? { ...u, is_active: true } : u)));
  };

  // NUEVO: Abrir modal y cargar datos del usuario
  const handleEdit = (user) => {
    setEditUser(user);
    setForm({
      username: user.username || "",
      email: user.email || "",
      full_name: user.full_name || "",
      bio: user.bio || "",
      birthday: user.birthday
        ? user.birthday.split("/").reverse().join("-") // de "dd/mm/yyyy" a "yyyy-mm-dd"
        : "",
      interest_ids: user.interests ? user.interests.map(i => i.id) : [],
      // profile_picture: user.profile_picture || null,
    });
    setErrorMsg("");
    setOpen(true);
  };

  // NUEVO: Guardar cambios
  const handleSave = () => {
    let birthdayFormatted = form.birthday;
    if (birthdayFormatted && birthdayFormatted.includes("/")) {
      // Si el usuario editó manualmente y puso dd/mm/yyyy
      birthdayFormatted = birthdayFormatted.split("/").reverse().join("-");
    }
    const dataToSend = {
      ...form,
      birthday: birthdayFormatted === "" ? null : birthdayFormatted,
      interest_ids: Array.isArray(form.interest_ids) ? form.interest_ids : [],
    };
    AxiosInstance.patch(`/user-admin/${editUser.id}/`, dataToSend)
      .then(res => {
        setUsers(users.map(u => u.id === editUser.id ? { ...u, ...form } : u));
        setSuccessMsg("Usuario actualizado correctamente."); // Mensaje de éxito
        setErrorMsg("");
        // Opcional: cerrar el modal después de unos segundos
        setTimeout(() => {
          setOpen(false);
          setSuccessMsg("");
        }, 1500);
      })
      .catch(err => {
        const msg = err.response?.data?.error || "Error al guardar cambios";
        setErrorMsg(msg);
        setSuccessMsg("");
      });
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'username',
      headerName: 'Usuario',
      width: 180,
      renderCell: (params) => (
        <Link
          to={`/perfil-publico/${encodeURIComponent(params.value)}`}
          style={{ color: "#1976d2", textDecoration: "underline", cursor: "pointer", fontWeight: 500 }}
        >
          {params.value}
          {!params.row.is_active && (
            <Typography variant="caption" color="error" sx={{ ml: 1 }}>
              (Suspendido)
            </Typography>
          )}
        </Link>
      )
    },
    { field: 'email', headerName: 'Email', width: 220 },
    {
      field: 'date_joined',
      headerName: 'Creado',
      width: 160,
    },
    {
      field: 'last_login',
      headerName: 'Última conexión',
      width: 180,
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 190,
      sortable: false,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ height: "100%" }}
        >
          <Tooltip title="Eliminar">
            <Button
              size="small"
              color="error"
              variant="contained"
              onClick={() => handleDelete(params.row.id)}
              sx={{ minWidth: 36, padding: 0.5, borderRadius: 2 }}
            >
              <DeleteIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="Suspender">
            <span>
              <Button
                size="small"
                color="warning"
                variant="contained"
                onClick={() => handleSuspend(params.row.id)}
                disabled={!params.row.is_active}
                sx={{ minWidth: 36, padding: 0.5, borderRadius: 2 }}
              >
                <BlockIcon fontSize="small" />
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Activar">
            <Button
              size="small"
              color="success"
              variant="contained"
              onClick={() => handleActivate(params.row.id)}
              disabled={params.row.is_active}
              sx={{ minWidth: 36, padding: 0.5, borderRadius: 2 }}
            >
              <CheckCircleIcon fontSize="small" />
            </Button>
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              size="small"
              color="primary"
              variant="outlined"
              onClick={() => handleEdit(params.row)}
              sx={{ minWidth: 36, padding: 0.5, borderRadius: 2 }}
            >
              <EditIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, width: "100%", ml: 2, mt: 4 }}>
      <Card elevation={3}>
        <CardContent>
          {/* <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", color: "primary.main" }}>
            Gestión de Usuarios
          </Typography> */}
          <Box sx={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={users}
              columns={columns}
              pageSize={8}
              rowsPerPageOptions={[8, 16, 32]}
              disableSelectionOnClick
              getRowClassName={(params) =>
                params.row.is_active ? "" : "datagrid-row-suspended"
              }
            />
          </Box>
        </CardContent>
      </Card>
      {/* Modal para editar usuario */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', bgcolor: 'background.paper',
          boxShadow: 24, p: 4, borderRadius: 2, minWidth: 300
        }}>
          <Typography variant="h6" mb={2}>Editar usuario</Typography>
          {successMsg && (
            <Alert severity="success" sx={{ mb: 2, fontWeight: "bold", fontSize: 16 }}>
              {successMsg}
            </Alert>
          )}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2, fontWeight: "bold", fontSize: 16 }}>
              {errorMsg}
            </Alert>
          )}
          <TextField
            label="Usuario"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            fullWidth margin="normal"
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={e => {
              setForm({ ...form, email: e.target.value });
              if (errorMsg && errorMsg.toLowerCase().includes("correo")) setErrorMsg("");
            }}
            fullWidth
            margin="normal"
            error={!!errorMsg && errorMsg.toLowerCase().includes("correo")}
            helperText={errorMsg && errorMsg.toLowerCase().includes("correo") ? errorMsg : ""}
            className={errorMsg && errorMsg.toLowerCase().includes("correo") ? "shake" : ""}
          />
          <TextField
            label="Nombre completo"
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
            fullWidth margin="normal"
          />
          <TextField
            label="Biografía"
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Fecha de nacimiento"
            type="date"
            value={form.birthday}
            onChange={e => setForm({ ...form, birthday: e.target.value || null })}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="interests-label">Intereses</InputLabel>
            <Select
              labelId="interests-label"
              multiple
              value={form.interest_ids || []}
              onChange={e => setForm({ ...form, interest_ids: e.target.value })}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const category = categories.find(c => c.id === value);
                    return (
                      <Chip key={value} label={category ? category.name : value} />
                    );
                  })}
                </Box>
              )}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2} mt={2} justifyContent="flex-end">
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="contained" onClick={handleSave}>Guardar</Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminUserManagement;