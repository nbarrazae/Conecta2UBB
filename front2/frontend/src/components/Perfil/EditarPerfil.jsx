import React, { useState, useEffect } from "react";
import "./EditarPerfil.css";
import AxiosInstance from "../axiosInstance";

const EditarPerfil = ({ perfil, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    bio: "",
    birthday: "",
    interest_ids: [],
  });

  const [originalData, setOriginalData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [availableInterests, setAvailableInterests] = useState([]);

  useEffect(() => {
    // Obtener intereses disponibles
    const fetchInterests = async () => {
      try {
        const res = await AxiosInstance.get("/categories/");
        setAvailableInterests(res.data);
      } catch (err) {
        console.error("Error al obtener intereses:", err);
      }
    };

    fetchInterests();
  }, []);

  useEffect(() => {
    if (perfil) {
      const formatFecha = (fechaStr) => {
        if (!fechaStr.includes("/")) return fechaStr;
        const [d, m, y] = fechaStr.split("/");
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      };

      const initial = {
        username: perfil.username || "",
        full_name: perfil.full_name || "",
        bio: perfil.bio || "",
        birthday: formatFecha(perfil.birthday || ""),
        interest_ids: perfil.interests?.map((i) => i.id) || [],
      };

      setFormData(initial);
      setOriginalData(initial);
    }
  }, [perfil]);

  const handleChange = (e) => {
    setErrors({});
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const validateDate = (dateStr) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const isModified = () => {
    return (
      formData.username !== originalData.username ||
      formData.full_name !== originalData.full_name ||
      formData.bio !== originalData.bio ||
      formData.birthday !== originalData.birthday ||
      selectedImage !== null ||
      JSON.stringify(formData.interest_ids) !==
        JSON.stringify(originalData.interest_ids)
    );
  };

  const handleInterestChange = (id, isChecked) => {
    setFormData((prev) => {
      const updated = isChecked
        ? [...prev.interest_ids, id]
        : prev.interest_ids.filter((i) => i !== id);
      return { ...prev, interest_ids: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario no puede estar vacío.";
    }
    if (!formData.full_name.trim()) {
      newErrors.full_name = "El nombre completo no puede estar vacío.";
    }
    if (formData.full_name.length > 50) {
      newErrors.full_name =
        "El nombre completo no puede superar los 50 caracteres.";
    }
    if (formData.bio.length > 300) {
      newErrors.bio = "La biografía no puede superar los 300 caracteres.";
    }
    if (!validateDate(formData.birthday)) {
      newErrors.birthday = "La fecha debe estar en formato YYYY-MM-DD.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("full_name", formData.full_name);
      data.append("bio", formData.bio);
      data.append("birthday", formData.birthday);

      if (formData.interest_ids.length > 0) {
        formData.interest_ids.forEach((id) => {
          data.append("interest_ids", id);
        });
      } else {
        // Enviamos marcador especial "0" para indicar que se deben limpiar todos los intereses
        data.append("interest_ids", "0");
      }

      if (selectedImage) {
        data.append("profile_picture", selectedImage);
      }

      const response = await AxiosInstance.put("/users/editar_perfil/", data, {
        headers: { "Content-Type": "multipart/form-data" },
        validateStatus: () => true,
      });

      if (response.status >= 200 && response.status < 300) {
        const modificados = [];
        for (const campo in formData) {
          if (
            campo === "interest_ids"
              ? JSON.stringify(formData[campo]) !==
                JSON.stringify(originalData[campo])
              : formData[campo] !== originalData[campo]
          ) {
            modificados.push(campo);
          }
        }
        if (selectedImage) {
          modificados.push("foto de perfil");
        }

        onUpdate(modificados);
        onClose();
      } else {
        const responseData = response.data;
        const newFieldErrors = {};
        for (const field in responseData) {
          let msg = Array.isArray(responseData[field])
            ? responseData[field][0]
            : responseData[field];

          if (
            field === "username" &&
            typeof msg === "string" &&
            msg.toLowerCase().includes("user with this username already exists")
          ) {
            msg = "Este nombre de usuario ya está en uso.";
          }

          newFieldErrors[field] = msg;
        }
        setErrors(newFieldErrors);
      }
    } catch (err) {
      console.error("❌ Error inesperado al actualizar perfil", err);
      setErrors({ general: "Error inesperado al contactar el servidor." });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Editar perfil</h2>
        <form onSubmit={handleSubmit}>
          <label>Nombre de usuario:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={errors.username ? "input-error" : ""}
          />
          <small>@{formData.username}</small>
          {errors.username && (
            <p className="input-error-text">{errors.username}</p>
          )}

          <label>Nombre completo:</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            maxLength={50}
            className={errors.full_name ? "input-error" : ""}
          />
          <small>{formData.full_name.length}/50</small>
          {errors.full_name && (
            <p className="input-error-text">{errors.full_name}</p>
          )}

          <label>Biografía:</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            maxLength={300}
            className={errors.bio ? "input-error" : ""}
          />
          <small>{formData.bio.length}/300</small>
          {errors.bio && <p className="input-error-text">{errors.bio}</p>}

          <label>Fecha de nacimiento:</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className={errors.birthday ? "input-error" : ""}
          />
          {errors.birthday && (
            <p className="input-error-text">{errors.birthday}</p>
          )}

          <label>Foto de perfil:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {selectedImage && (
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Vista previa"
              className="preview-avatar"
            />
          )}

          <label>Intereses:</label>
          <div className="interests-chip-container">
            {availableInterests.map((interest) => {
              const isSelected = formData.interest_ids.includes(interest.id);
              return (
                <div
                  key={interest.id}
                  className={`interest-chip ${isSelected ? "selected" : ""}`}
                  onClick={() =>
                    handleInterestChange(
                      interest.id,
                      !formData.interest_ids.includes(interest.id)
                    )
                  }
                >
                  {interest.name}
                </div>
              );
            })}
          </div>

          {errors.general && <p className="modal-error">{errors.general}</p>}

          <div className="modal-buttons">
            <button
              type="submit"
              className="guardar-btn"
              disabled={!isModified()}
              title={!isModified() ? "No hay cambios para guardar" : ""}
            >
              Guardar
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfil;
