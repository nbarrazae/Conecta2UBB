import { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import AdminReports from "./AdminReports";
import AdminCommentReports from "./AdminCommentReports";

const AdminModeration = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ justifyContent: "flex-start" }}
        variant="standard"
      >
        <Tab label="Reportes de Eventos" />
        <Tab label="Reportes de Comentarios" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tab === 0 && <AdminReports />}
        {tab === 1 && <AdminCommentReports />}
      </Box>
    </Box>
  );
};

export default AdminModeration;