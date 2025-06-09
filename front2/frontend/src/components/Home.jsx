import AxiosInstance from './axiosInstance'
import { React, useEffect, useMemo, useState } from 'react';
import {Box} from '@mui/material';


const Home = () => {

    const [myData, setMyData] = useState([]);
    const [loading, setLoading] = useState(true);
     const GetData = () => {
        AxiosInstance.get('users/').then((res) => {
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
                    <h1>My Data</h1>
                </div>
            )}
            <div>
                {myData.map((item, index) => (
                    <Box key={index} sx={{ padding: 2, border: '1px solid #ccc', marginBottom: 2 }}>
                        <h3>ID: {item.id} Username: {item.username || 'Null'}</h3>
                        <p>Email: {item.email}</p>
                    </Box>
                ))}

            </div>

        </div>
    )
}

export default Home;