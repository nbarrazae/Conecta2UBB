import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import AxiosInstance from './axiosInstance';
import BotonInscripcion from './BotonInscripcion';

const VerEvento = () => {
    const [evento, setEvento] = useState(null);
    const [imagenes, setImagenes] = useState([]);
    const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
    const [myData, setMyData] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

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

    const fetchUserData = async () => {
        try {
            const response = await AxiosInstance.get("user_data/");
            setMyData(response.data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    useEffect(() => {
        fetchEvento();
        fetchCategorias();
        fetchUserData();
    }, [id]);

    const isAuthenticated = !!localStorage.getItem("Token");

    const handleRedirect = () => {
        if (isAuthenticated) {
            navigate('/home');
        } else {
            navigate('/login');
        }
    };

    if (!evento || !myData) {
        return <div>Cargando...</div>;
    }

    const yaInscrito = evento.participants.includes(myData.email);
    const estaLleno = evento.participants.length >= (evento.max_participants || evento.limite_asistentes || 0);

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={styles.title}>
                    {evento.title}
                </h2>
                <BotonInscripcion
                    eventId={evento.id}
                    yaInscrito={yaInscrito}
                    estaLleno={estaLleno}
                    onCambio={fetchEvento}
                    style={{ marginLeft: '20px' }}
                />
            </div>
            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Información</h3>
                <p><strong>Lugar:</strong> {evento.location}</p>
                <p><strong>Fecha:</strong> {evento.event_date}</p>
                <p><strong>Categoría:</strong> {categoriasDisponibles.find(cat => cat.id === evento.category)?.name || 'Sin categoría'}</p>
                <p><strong>Creador del Evento:</strong> {evento.author_username}</p>
                <p><strong>Participantes:</strong> {evento.participants.length}/{evento.max_participants}</p>
            </div>

            <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Sobre el Evento + Imagenes del Evento</h3>
                <p>{evento.description}</p>
                <div style={styles.imageContainer}>
                    {imagenes.map((img, idx) => (
                        <div key={idx} style={styles.imageWrapper}>
                            <img
                                src={img.url}
                                alt={`imagen-${idx}`}
                                style={styles.image}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* <BotonInscripcion
                eventId={evento.id}
                yaInscrito={yaInscrito}
                estaLleno={estaLleno}
                onCambio={fetchEvento}
            /> */}

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
