// src/components/Perfil/Perfil.jsx
import React from "react";
import UserProfile from "./UserProfile";
import "./Perfil.css";

const Perfil = () => {
  return (
    <div className="perfil-wrapper">
      <div className="perfil-page">
        <div className="perfil-content">
          <UserProfile />
        </div>
      </div>
    </div>
  );
};

export default Perfil;
