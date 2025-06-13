import "../App.css"
import { React, useEffect, useMemo, useState } from 'react';
import {Box} from "@mui/material";
import MyTextField from "./forms/MyTextField";
import MyPassField from "./forms/MyPassField";
import MyButton from "./forms/MyButton";
import { Link,useNavigate,  } from "react-router-dom";
import { useForm } from "react-hook-form";
import AxiosInstance from "./axiosInstance";
import { Navigate } from "react-router-dom";
import MyMessage from "./Message";


const PasswordResetRequest = () =>{
    const navigate = useNavigate()
    const {handleSubmit, control} = useForm()

    const [ShowMessage, setShowMessage] = useState(false)


    const submission = (data) => {
        AxiosInstance.post(`api/password_reset/`,{
            email: data.email, 
        })

        .then((response) => {
            setShowMessage(true)
        })
      
    }
    return(
        <div className={"myBackground"}> 

        {ShowMessage ? <MyMessage text={"Si el correo es valido se enviaran las instruccion, revisar carpeta spam"}  color={'#69C9AB'}/> : null}
        <form onSubmit={handleSubmit(submission)}>

        

        <Box className={"whiteBox"}>

            <Box className={"itemBox"}>
                <Box className={"title"}> Request password reset </Box>
            </Box>

            <Box className={"itemBox"}>
                <MyTextField
                label={"Email"}
                name ={"email"}
                control={control}
                />
            </Box>

            <Box className={"itemBox"}>
                <MyButton 
                    label={"Enviar correo"}
                    type={"submit"}
                />
            </Box>

            <Box className={"itemBox"} sx={{flexDirection:'column'}}>
             
            </Box>


        </Box>

    </form>
        
    </div>
    )

}

export default PasswordResetRequest