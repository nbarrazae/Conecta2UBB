import "../App.css"
import { useState } from "react";
import { Box } from "@mui/material";
import MyTextField from "./forms/MyTextField";
import MyPassField from "./forms/MyPassField";
import MyButton from "./forms/MyButton";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AxiosInstance from "./axiosInstance";

const Login = () => {
    const { handleSubmit, control } = useForm({});
    const navigate = useNavigate();
    const [errorMsg, setErrorMsg] = useState(null);

    const submission = (data) => {
        setErrorMsg(null); // Limpiar errores previos

        AxiosInstance.post("login/", {
            email: data.email,
            password: data.password,
        })
            .then((response) => {
                console.log(response.data);
                localStorage.setItem("Token", response.data.token);
                navigate("/home");
            })
            .catch((error) => {
                console.error("Error al iniciar sesión:", error.response);

                if (error.response?.data) {
                    const values = Object.values(error.response.data);
                    const mensaje = values.flat().join(" ");
                    setErrorMsg(mensaje);
                } else {
                    setErrorMsg("Error al iniciar sesión. Verifique sus credenciales.");
                }
            });
    };

    return (
        <div className="myBackground">
            <form onSubmit={handleSubmit(submission)} className="formBox">
                <Box className="whiteBox">
                    <Box className="itemBox">
                        <Box className="title">Iniciar Sesión</Box>

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
                        <MyTextField
                            label={"Email"}
                            name={"email"}
                            control={control}
                        />
                    </Box>

                    <Box className="itemBox">
                        <MyPassField
                            label={"Password"}
                            name={"password"}
                            control={control}
                        />
                    </Box>

                    <Box className="itemBox">
                        <MyButton
                            label={"Login"}
                            type={"submit"}
                        />
                    </Box>

                    <Box className="itemBox" sx={{ flexDirection: 'column', alignItems: "center" }}>
                        <Link to="/register" className="link">Click aquí para registrarse</Link>
                        <Link to="/request/password_reset" className="link">¿Olvidaste tu contraseña?</Link>
                    </Box>
                </Box>
            </form>
        </div>
    );
};

export default Login;
