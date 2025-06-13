import "../App.css"
import { useState } from 'react';
import { Box } from "@mui/material";
import MyPassField from "./forms/MyPassField";
import MyButton from "./forms/MyButton";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AxiosInstance from "./axiosInstance";
import MyMessage from "./Message";

const PasswordReset = () => {
    const navigate = useNavigate();
    const { handleSubmit, control } = useForm();
    const [errorMsg, setErrorMsg] = useState(null);
    const [ShowMessage, setShowMessage] = useState(false);
    const { token } = useParams(); // Get the token from the URL parameters

    const submission = (data) => {
        setErrorMsg(null); // Limpiar errores previos
    
        AxiosInstance.post(`api/password_reset/confirm/`, {
            password: data.password,
            token: token,
            confirm_password: data.password2,
        })
            .then((response) => {
                // Confirmamos que la respuesta fue 200 u otra de éxito
                if (response.status === 200 || response.status === 201) {
                    setShowMessage(true);
                    setTimeout(() => {
                        navigate('/login');
                    }, 6000);
                } else {
                    // Si llega aquí, pero no es status 200, lo tomamos como error
                    setErrorMsg("No se pudo restablecer la contraseña.");
                }
            })
            .catch((error) => {
                console.error("Respuesta completa del backend:", error.response);
    
                if (error.response?.data) {
                    const values = Object.values(error.response.data);
                    const mensaje = values.flat().join(" ");
                    setErrorMsg(mensaje);
                } else {
                    setErrorMsg("Ocurrió un error inesperado.");
                }
            });
    };
    

    return (
        <div className={"myBackground"}>
            {ShowMessage && (
                <MyMessage
                    text={"Password reset successfully, you will be redirected shortly."}
                    color={"#69C9AB"}
                />
            )}

            <form onSubmit={handleSubmit(submission)} className={"formBox"}>
                <Box className={"whiteBox"}>
                    <Box className={"itemBox"}>
                        <Box className={"title"}>Reset password</Box>

                        {errorMsg && (
                            <div style={{
                                color: "white",
                                backgroundColor: "rgba(255,0,0,0.8)",
                                borderRadius: "3px",
                                padding: "10px",
                                marginTop: "10px",
                                fontWeight: "bold",
                                fontSize: "14px"
                            }}>
                                {errorMsg}
                            </div>
                        )}
                    </Box>

                    <Box className="itemBox">
                        <MyPassField
                            label={"Password"}
                            name={"password"}
                            control={control}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <MyPassField
                            label={"Confirm password"}
                            name={"password2"}
                            control={control}
                        />
                    </Box>

                    <Box className={"itemBox"}>
                        <MyButton
                            label={"Reset password"}
                            type={"submit"}
                        />
                    </Box>
                </Box>
            </form>
        </div>
    );
};

export default PasswordReset;
