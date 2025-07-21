import React, { useEffect, useState } from "react";
import AxiosInstance from "./axiosInstance";
import { Box, Card, CardContent, Typography, Button, Stack } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import Tooltip from "@mui/material/Tooltip";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    AxiosInstance.get("/user-admin/")
      .then(res => setUsers(res.data))
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

  const handleEdit = (user) => {
    alert(`Editar usuario: ${user.username}`);
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
      width: 200,
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

  console.log(users);

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
    </Box>
  );
};

export default AdminUserManagement;