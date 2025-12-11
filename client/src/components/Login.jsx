// In your Login.jsx
import React from "react";
import LoginOne from "./LoginOne";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    navigate("/profile");
  };
  

  
  return (
    <div>
      <LoginOne 
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Login;