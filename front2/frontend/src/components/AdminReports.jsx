import { useEffect, useState } from "react";
import AxiosInstance from "./axiosInstance";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    AxiosInstance.get("event-reports/").then((res) => {
      setReports(res.data);
      setLoading(false);
    });
  };

  const handleAction = (id, action) => {
    AxiosInstance.post(`event-reports/${id}/${action}/`).then(() => fetchReports());
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div>
      <h2>Gestión de Reportes de Eventos</h2>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Evento</th>
              <th>Reportado por</th>
              <th>Razón</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.event}</td>
                <td>{r.reporter}</td>
                <td>{r.reason}</td>
                <td>{r.status}</td>
                <td>
                  {r.status === "pending" && (
                    <>
                      <button onClick={() => handleAction(r.id, "accept")}>Aceptar</button>
                      <button onClick={() => handleAction(r.id, "reject")}>Rechazar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminReports;