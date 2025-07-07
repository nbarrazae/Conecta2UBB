import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import AxiosInstance from './axiosInstance';

const VerEvento = () => {
    const [evento, setEvento] = useState(null);
    const [imagenes, setImagenes] = useState([]);
    const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams(); // Obtener el ID del evento desde la URL

    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const response = await AxiosInstance.get(`eventos/${id}/`);
                setEvento(response.data);
                setImagenes(response.data.imagenes || []);
            } catch (error) {
                console.error("Error fetching event:", error);
            }
        };

        const fetchCategorias = async () => {
            try {
                const response = await AxiosInstance.get('categories/');
                setCategoriasDisponibles(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchEvento();
        fetchCategorias();
    }, [id]);

    const isAuthenticated = !!localStorage.getItem("Token");

    const handleRedirect = () => {
        if (isAuthenticated) {
            navigate('/home');
        } else {
            navigate('/login');
        }
    };

    if (!evento) {
        return <div>Cargando...</div>;
    }

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
            <h2 style={styles.title}>{evento.title}</h2>
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Información</h3>
                <p><strong>Lugar:</strong> {evento.location}</p>
                <p><strong>Fecha:</strong> {evento.event_date}</p>
                <p><strong>Categoría:</strong> {categoriasDisponibles.find(cat => cat.id === evento.category)?.name || 'Sin categoría'}</p>
                <p><strong>Límite de asistentes:</strong> {evento.limite_asistentes}</p>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Sobre el Evento</h3>
                <p>{evento.description}</p>
                <div style={styles.imageContainer}>
                    {imagenes.map((img, idx) => (
                        <div key={idx} style={styles.imageWrapper}>
                            <img
                                src={img.url} // Asumiendo que el backend devuelve una URL para cada imagen
                                alt={`imagen-${idx}`}
                                style={styles.image}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Comentarios</h3>
                {/* Espacio para comentarios a futuro */}
            </div>
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
    section: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        marginBottom: '20px',
    },
    sectionTitle: {
        fontSize: '20px',
        marginBottom: '10px',
        color: '#333',
    },
    imageContainer: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    imageWrapper: {
        textAlign: 'center',
    },
    image: {
        width: '80px',
        height: '80px',
        objectFit: 'cover',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
};

export default VerEvento;
