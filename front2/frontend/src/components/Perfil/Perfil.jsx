// src/components/Perfil/Perfil.jsx
import React from "react";
import UserProfile from "./UserProfile";
import "./Perfil.css";

const Perfil = () => {
  return (
    <div className="perfil-wrapper">
      <div className="perfil-page">
        <div className="perfil-content">
          <h1 className="perfil-title">Mi perfil</h1>
          <UserProfile />
        </div>
      </div>
    </div>
  );
};

export default Perfil;
