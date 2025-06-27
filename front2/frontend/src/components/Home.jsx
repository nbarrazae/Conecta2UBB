import AxiosInstance from './axiosInstance';
import { React, useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [myData, setMyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [Events, setEvents] = useState([]);

    const GetData = () => {
        AxiosInstance.get('user_data/').then((res) => {
            setMyData(res.data);
            console.log(res.data);
            setLoading(false);
        });
    };

    const GetEvents = () => {
        AxiosInstance.get('eventos/').then((res) => {
            setEvents(res.data);
            console.log(res.data);
        });
    };

    useEffect(() => {
        GetData();
        GetEvents();
    }, []);

    const handleRedirect = () => {
        navigate('/crear-evento'); // Replace with the actual route for "CrearEvento"
    };

    return (
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <Button variant="contained" color="primary" onClick={handleRedirect}>
                        Ir a CrearEvento
                    </Button>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value !== null && value !== undefined ? value.toString() : '—'}
                            </li>
                        ))}
                    </ul>
                    <h2>Eventos:</h2>
                    <ul>
                        {Events.map((event) => (
                            <li key={event.id} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
                                <strong>{event.title}</strong> - {event.description} <br />
                                Fecha: {new Date(event.event_date).toLocaleDateString()} <br />
                                Ubicación: {event.location} <br />
                                Estado: {event.state} <br />
                                Categoría: {event.category_name} <br />
                                Participantes: {event.participants.length}/{event.max_participants}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Home;
