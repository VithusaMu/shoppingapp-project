import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditProductView() {
	const { id } = useParams(); 
    const [formData, setFormData] = useState({
        productName: "",
        price: "",
        pictureURL: "",
        inventoryNumber: "",
        category: "",
        sellerId: "",
    });
	const [error, setError] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchProduct = async () => {
			try {
				const res = await fetch(`http://localhost:3000/product/${id}`, {
					credentials: "include",
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.message);
                const { _id, ...cleanedData } = data.payload
                cleanedData.sellerId = data.payload.sellerId.toString();
				setFormData(cleanedData);
			} catch (err) {
				setError("Failed to fetch product: " + err.message);
			}
		};
		fetchProduct();
	}, [id]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const res = await fetch(`http://localhost:3000/product/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					price: Number(formData.price),
					inventoryNumber: Number(formData.inventoryNumber),
				}),
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message);
			alert("Product updated successfully.");
		} catch (err) {
			setError("Error updating product: " + err.message);
		}
	};

	const handleDelete = async () => {
        if (confirm("Are you sure you want to delete?")) {
            try {
                const res = await fetch(`http://localhost:3000/product/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                });
                const data = await res.json();
                console.log(data.message)
                if (res.ok) {
                    console.log("ok")


                    alert(`Product deleted.`);
                    navigate("/products");  
				}

            } catch (err) {
                setError("Error deleting product: " + err.message);
            }
        }
        else {
			alert("Delete canceled")
		}


	};

	if (!formData) return <p>Loading...</p>;

	return (
        <div className="edit-page-container">
                <h2 style={{ textAlign: "center" }}>Edit Product</h2>
                {error && <p style={{ color: "red" }}>{error}</p>}

        <form className="edit-form" onSubmit={handleSubmit}>
        <div className="edit-layout">
            <div className="edit-left">
            <label>Product Name</label>
            <input type="text" name="productName" value={formData.productName} onChange={handleChange} />

            <label>Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} />

            <label>Inventory</label>
            <input type="number" name="inventoryNumber" value={formData.inventoryNumber} onChange={handleChange} />

            <label>Category</label>
            <input type="text" name="category" value={formData.category} onChange={handleChange} />
            </div>


            <div className="edit-right">
            <label>Picture URL</label>
            <input type="text" name="pictureURL" value={formData.pictureURL} onChange={handleChange} />

            {formData.pictureURL && (
                <img src={formData.pictureURL} alt="Preview" />
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="submit">Save</button>
                <button type="button" onClick={() => navigate("/products")}>Back to Products</button>
                <button type="button" onClick={handleDelete}>Delete</button>
            </div>
            </div>
        </div>
        </form>

        </div>
	);
}
