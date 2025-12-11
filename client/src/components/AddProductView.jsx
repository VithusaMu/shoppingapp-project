import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
export default function AddProductView(){
    const [formData, setFormData] = useState({
		productName: "",
		price: "",
		pictureURL: "",
		inventoryNumber: "",
		category: ""
	});
    const navigate = useNavigate();

    const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    };

	const handleSubmit = async (e) => {
		e.preventDefault();
        
        const available = formData.inventoryNumber == 0 ? false : true
		try {
			const response = await fetch("http://localhost:3000/product", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					productName: formData.productName,
					price: Number(formData.price),
					pictureURL: formData.pictureURL,
					inventoryNumber: Number(formData.inventoryNumber),
					category: formData.category,
                    available: available
				}),
				credentials: "include"
			});

			const data = await response.json();
            console.log(data)
			if (!response.ok) throw new Error(data.message);
			alert(`Product added!`);
		} catch (err) {
			alert(`Error with adding product: ${err}`)
		}
	};

    const onCancel = () => {
	    navigate("/products"); 
    };
 
    return (
        <div className="add-page-container">
            <form className="add-form" onSubmit={handleSubmit}>
            <h2 style={{ textAlign: "center" }}>Add a New Product</h2>

            <label>Name</label>
            <input type="text" name="productName" value={formData.productName} onChange={handleChange} />

            <label>Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} />

            <label>Inventory Number</label>
            <input type="number" name="inventoryNumber" value={formData.inventoryNumber} onChange={handleChange} />

            <label>Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} />

            <label>Picture URL</label>
            <input type="text" name="pictureURL" value={formData.pictureURL} onChange={handleChange} />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="submit">Add Product</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
            </form>
        </div>
	);
};