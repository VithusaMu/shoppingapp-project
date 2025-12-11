// src/components/LoginOne.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

const LoginOne = ({ onLoginSuccess }) => {
  // State for form values
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: ""
  });
  const { user, setUser, isLoading: contextLoading } = useUser();
  const navigate = useNavigate();
  
  // State for validation errors
  const [errors, setErrors] = useState({});

  // State for login process
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user && window.location.pathname === '/') {
      console.log("User is already logged in, redirecting to profile");
      navigate('/profile');
    }
  }, [user, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear related error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  // Handle radio button selection
  const handleRoleChange = (e) => {
    setFormData({
      ...formData,
      role: e.target.value
    });
    
    if (errors.role) {
      setErrors({
        ...errors,
        role: ""
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } 
    // Validate role
    if (!formData.role) {
      newErrors.role = "Please select a role";
    } else if (!["customer", "seller"].includes(formData.role)) {
      newErrors.role = "Invalid role selected";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Submitting login with data:", {
        username: formData.username,
        password: formData.password,
        role: formData.role.toLowerCase()
      });
      
      const response = await fetch('http://localhost:3000/person/login', {
        method: 'POST',
        mode: "cors",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          role: formData.role.toLowerCase()
        }),
        credentials: 'include'  // Important for cookies
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
      
      console.log("Login response data:", data);
      
      // Set the user in context
      setUser(data);
      console.log("User data saved to context");
      
      // Navigate after saving data
      if (onLoginSuccess) {
        onLoginSuccess(data);
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    navigate('/createAccount');
  };

  // Show loading while checking session
  if (contextLoading) {
    return <div>Checking authentication...</div>;
  }

  return (
    <div className="login-page-container">
      <h1 className="login-title">Welcome</h1>

      {loginError ? (
        <div className="error-message">
          {loginError}
        </div>
      ) : null}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="role-selection">
          <label>
            <input
              type="radio"
              name="role"
              value="customer"
              checked={formData.role === "customer"}
              onChange={handleRoleChange}
            />
            Customer
          </label>

          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              name="role"
              value="seller"
              checked={formData.role === "seller"}
              onChange={handleRoleChange}
            />
            Seller
          </label>

          {errors.role && <div className="field-error">{errors.role}</div>}
        </div>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
        />
        {errors.username && <div className="field-error">{errors.username}</div>}

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <div className="field-error">{errors.password}</div>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <button className="secondary-btn" onClick={handleCreateAccount}>
        Create New Account
      </button>
    </div>

  );
};

export default LoginOne;