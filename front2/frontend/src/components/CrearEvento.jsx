import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography } from '@mui/material';
import AxiosInstance from './axiosInstance'; // o la ruta correcta
import { useEffect } from 'react';

const CrearEvento = () => {
    const [imagenes, setImagenes] = useState([]);
    const [nombre, setNombre] = useState("");
    const [categoria, setCategoria] = useState("");
    const [lugar, setLugar] = useState("");
    const [fecha, setFecha] = useState("");
    const [limiteAsistentes, setLimiteAsistentes] = useState("");
    const [descripcion, setDescripcion] = useState("");

    const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await AxiosInstance.get('categories/');
                setCategoriasDisponibles(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategorias();
    }, []);

    const navigate = useNavigate();
    const isAuthenticated = !!localStorage.getItem("Token");

    const handleRedirect = () => {
        if (isAuthenticated) {
        navigate('/home');
        } else {
        navigate('/login');
        }
        };

    const handleImagenes = (e) => {
        const files = Array.from(e.target.files);
        setImagenes((prev) => [...prev, ...files]);
    };

    const handleReordenar = (fromIndex, toIndex) => {
        const newOrden = [...imagenes];
        const [moved] = newOrden.splice(fromIndex, 1);
        newOrden.splice(toIndex, 0, moved);
        setImagenes(newOrden);
    };

    const handleEliminarImagen = (index) => {
        setImagenes((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append("title", nombre);
        formData.append("category", 1);
        formData.append("location", lugar);
        formData.append("event_date", fecha);
        formData.append("description", descripcion);
        formData.append("limite_asistentes", limiteAsistentes); // si el backend lo espera así

        formData.append("descripcion", descripcion);

        imagenes.forEach((img, index) => {
            formData.append("imagenes", img);
            formData.append(`orden_${index}`, index); // importante para el backend
        });

        await AxiosInstance.post("eventos/", formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((response) => {
            console.log("Evento creado:", response.data);
            alert("Evento creado exitosamente");
            navigate('/home'); // Redirigir al inicio después de crear el evento
        })
    };

    return (
        <div style={styles.container}>
            <Button
                onClick={handleRedirect}
                style={{
                    width: '10%',
                    marginLeft: '8%',
                    padding: '15px',
                    backgroundColor: '#007BFF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '10px',
                }}
                >
                {isAuthenticated ? 'Ir al Inicio' : 'Ir al Login'}
            </Button>
            <h2 style={styles.title}>Crear tu Evento</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Información</h3>
                    <div style={styles.row}>
                        <input type="text" placeholder="Nombre del Evento" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={styles.input} />
                        <input type="text" placeholder="Lugar" value={lugar} onChange={(e) => setLugar(e.target.value)} required style={styles.input} />
                    </div>
                    <div style={styles.row}>
                    <select
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        required
                        style={styles.input}
                            >
                        <option value="">Elige una categoría</option>
                        {categoriasDisponibles.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>


                        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required style={styles.input} />
                    </div>
                    <div style={styles.row}>
                        <input type="number" placeholder="Límite asistentes" value={limiteAsistentes} onChange={(e) => setLimiteAsistentes(e.target.value)} style={styles.input} />
                    </div>
                </div>

                <div style={styles.section}>
                    <h3 style={styles.sectionTitle}>Sobre el Evento</h3>
                    <textarea placeholder="Escribe sobre el evento..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} style={styles.textarea} />
                    <input type="file" multiple accept="image/*" onChange={handleImagenes} style={styles.fileInput} />
                    <div style={styles.imageContainer}>
                        {imagenes.map((img, idx) => (
                            <div key={idx} style={styles.imageWrapper}>
                                <img
                                    src={URL.createObjectURL(img)}
                                    alt={`imagen-${idx}`}
                                    style={styles.image}
                                />
                                <div style={styles.imageName}>
                                    {/* {img.name} */}
                                    </div>
                                
                                {idx > 0 && <button type="button" onClick={() => handleReordenar(idx, idx - 1)} style={styles.button}>←</button>}
                                <button
                                    type="button"
                                    onClick={() => handleEliminarImagen(idx)}
                                    style={styles.deleteButton}
                                >
                                    X
                                </button>
                                {idx < imagenes.length - 1 && <button type="button" onClick={() => handleReordenar(idx, idx + 1)} style={styles.button}>→</button>}
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" style={styles.submitButton}>Publicar Evento</button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '1200px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    title: {
        textAlign: 'center',
        fontSize: '28px',
        color: '#333',
        marginBottom: '20px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    section: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
    },
    sectionTitle: {
        fontSize: '20px',
        marginBottom: '10px',
        color: '#333',
    },
    row: {
        display: 'flex',
        gap: '10px',
        marginBottom: '10px',
    },
    input: {
        flex: 1,
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    textarea: {
        width: '100%',
        height: '100px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        resize: 'none',
    },
    fileInput: {
        marginTop: '10px',
    },
    imageContainer: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    imageWrapper: {
        position: 'relative',
        textAlign: 'center',
    },
    image: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    imageName: {
        fontSize: '10px',
        marginTop: '5px',
    },
    deleteButton: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        opacity: '0',
        color: 'red',
        width: '80px',
        height: '80px',
        cursor: 'pointer',
        fontSize: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

    },
    button: {
        marginTop: '5px',
        padding: '5px',
        fontSize: '12px',
        cursor: 'pointer',
    },
    submitButton: {
        width: '20%',
        marginLeft: '40%',
        padding: '15px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '18px',
    },
};

export default CrearEvento;
