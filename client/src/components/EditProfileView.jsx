import React, { useEffect, useState } from "react";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";

export default function EditProfileView() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phoneNumber: "",
    password: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      const userData = user.payload || user;
      setFormData({
        username: userData.username || "",
        name: userData.name || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber?.toString() || "",
        password: ""
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phoneNumber" ? value.replace(/\D/, "") : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const userData = user.payload || user;
      const res = await fetch(`http://localhost:3000/person/${userData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: Number(formData.phoneNumber),
          password: formData.password || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setUser(prev => ({
        ...prev,
        ...data 
      }));
      alert("Profile updated!");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete your account!?")) {
        try {
          const userData = user.payload || user;
          console.log("Deleting ID:", userData._id);
          const res = await fetch(`http://localhost:3000/person/${userData._id}`, {
              method: "DELETE",
              credentials: "include",
          });
          const data = await res.json();
          console.log(data.message)
          if (res.ok) {
            alert(`Account deleted.`);
            setUser(null)
            navigate("/");  
				  }

        } catch (err) {
          console.error("Error deleting product: " + err.message);
        }
        }
    else {
			alert("Delete canceled")
		}
  };

  return (
   <div className="add-page-container">
      <h2>Edit Your Profile</h2>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <form className="edit-form" onSubmit={handleSubmit}>
        <div className="edit-layout">
          {/* LEFT COLUMN */}
          <div className="edit-left">
            <label>Username</label>
            <input name="username" type="text" value={formData.username} disabled />

            <label>Name</label>
            <input name="name" type="text" value={formData.name} onChange={handleChange} />

            <label>Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} />

            <label>Phone Number</label>
            <input name="phoneNumber" type="text" value={formData.phoneNumber} onChange={handleChange} />
          </div>

          {/* RIGHT COLUMN */}
          <div className="edit-right">
            <label>New Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} />

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
              <button type="submit">Save</button>
              <button type="button" onClick={() => navigate("/profile")}>Cancel</button>
              <button type="button" onClick={handleDelete} style={{ backgroundColor: "#f44336", color: "white" }}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
