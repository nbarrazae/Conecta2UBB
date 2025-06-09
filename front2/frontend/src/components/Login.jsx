import "../App.css"
import {Box} from "@mui/material";
import MyTextField from "./forms/MyTextField";
import MyPassField from "./forms/MyPassField";
import MyButton from "./forms/MyButton";
import { Link,useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import AxiosInstance from "./axiosInstance";
import { Navigate } from "react-router-dom";



const Login = () => {
    const {handleSubmit, control} = useForm({});
    const navigate = useNavigate();

    const submission = (data) => {

        AxiosInstance.post("login/",{ 
            email: data.email,
            password: data.password,
    })
        .then((response) => {
            console.log(response.data);
            localStorage.setItem("Token", response.data.token); // Store the token in localStorage
             navigate("/home");
        })
        .catch((error) => {
            console.error("There was an error logging in!", error);
            // Optionally, you can handle the error here, e.g., show a notification
            // or set an error state to display a message to the user.
        });
    }

    return (
        <div className="myBackground" >
        <form onSubmit={handleSubmit(submission)} className="formBox">
        <Box className="whiteBox">

            <Box className="itemBox">
                <Box className="title"> Logueece </Box>
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

            <Box className="itemBox">
                <Link to="/register" className="link"> Click aquí para registrarse  </Link>
                
            </Box>

        </Box>
        </form>

        </div>
    )
}

export default Login;