import AxiosInstance from './axiosInstance'
import { React, useEffect, useMemo, useState } from 'react';
import {Box} from '@mui/material';


const Home = () => {

    const [myData, setMyData] = useState([]);
    const [loading, setLoading] = useState(true);
     const GetData = () => {
        AxiosInstance.get('user_data/').then((res) => {
            setMyData(res.data);
            console.log(res.data);
            setLoading(false);
        })}

        useEffect(( ) => {
            GetData();

        }, []);

    return (
        <div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                    <h1>Authenticated User: {myData.username || 'Null'}</h1>
                    <ul>
                        {myData && Object.entries(myData).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key}:</strong> {value.toString()}
                            </li>
                        ))}
                    </ul>
                </div>
                
            )}

        </div>
    )
}

export default Home;