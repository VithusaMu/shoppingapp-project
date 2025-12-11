import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateAccountView() {
  const [formData, setFormState] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    phoneNumber: "",
    role: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e) => {
    setFormState(prev => ({
        ...prev,
        role: e.target.value.toLowerCase()
    }));
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    const { username, email, password, name, phoneNumber, role } = formData;
    if (!username || !email || !password || !name || !phoneNumber || !role) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/person", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          email,
          name,
          phoneNumber: Number(phoneNumber),
          role: role.toLowerCase(), // "customer" or "seller"
        }),
        credentials: "include"
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Account successfully created!");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`Error with registering + ${err}`);
    }
  };

  const onCancel = () => {
	navigate("/"); 
    };
 
return (

    <form onSubmit={handleSubmit} className="create-form">
      <h2 className="form-title">Register a New Account</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div style={{ color: "lightgreen" }}>{success}</div>}

      <div className="create-layout">
        {/* LEFT SIDE */}
        <div className="create-left">
          <label>Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} />

          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />

          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
        </div>

        {/* RIGHT SIDE */}
        <div className="create-right">
          <label>Your Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} />

          <label>Phone Number</label>
          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />

          <label>Role</label>
          <div className="role-selection">
            <label><input type="radio" name="role" value="customer" checked={formData.role === "customer"} onChange={handleRoleChange} />Customer</label>
            <label><input type="radio" name="role" value="seller" checked={formData.role === "seller"} onChange={handleRoleChange} />Seller</label>
          </div>

          <div className="profile-actions">
            <button type="submit" className="profile-btn green">Create</button>
            <button type="button" onClick={onCancel} className="profile-btn red">Cancel</button>
          </div>
        </div>
      </div>
    </form>

);
    
}
