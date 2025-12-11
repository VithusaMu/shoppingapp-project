import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function ProductsView() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const [sortOption, setSortOption] = useState("name");
    const [addingToCart, setAddingToCart] = useState({});
    const navigate = useNavigate();
    



    const handleAddToCart = async (product) => {
        try {
            
            setAddingToCart(prev => ({ ...prev, [product._id]: true }));
            
            
            const response = await fetch(`http://localhost:3000/cart/${product._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: 1 }), 
            credentials: 'include',
            });
            
            const data = await response.json();
            
            if (!response.ok) {
            throw new Error(data.message || 'Failed to add to cart');
            }
            
            // Show success message
            alert(`Added ${product.productName} to cart!`);
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setAddingToCart(prev => ({ ...prev, [product._id]: false }));
        }
    };
    const loadSession = async () => {
        try {
            const res = await fetch("http://localhost:3000/person/session", {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Not logged in");
            const data = await res.json();
            setUser(data);
        } catch {
            setError("You must be logged in to view products.");
        }
    };
    


    useEffect(() => {
        loadSession();
    }, []);

    useEffect(() => {
        if (!user) return;
        const fetchProducts = async () => {
            try {
                const response = await fetch(`http://localhost:3000/product?sort=${sortOption}`, {
                    credentials: "include",
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message);
                }
                setProducts(data.payload);

                console.log(data.payload)
            }
            catch (err) {
                setError(`Error with viewing products: ${err}`);
            }
        };
        fetchProducts();
    }, [user, sortOption]);

    const onCancel = () => {
        navigate("/profile");
    };


    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!user) return <p>Loading session...</p>;

    const isSeller = user.role === "seller";
    const userId = user.personId;

    return (
        <div>
            <h1>{isSeller ? "Your Products" : "All Products"}</h1>
            <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: "1rem" }}>
                <label style={{ color: "white", marginRight: "0.5rem" }}>Sort by:</label>
                <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{ padding: "0.25rem" }}
                >
                <option value="name">Product Name</option>
                <option value="price">Price</option>
                {!isSeller && <option value="seller">Seller Name</option>}
                </select>
            </div>
            <div className="product-buttons">
                {isSeller && (
                    <button 
                        onClick={() => navigate("/addProduct")}
                        className="product-button green-btn"
                    >
                        Add a New Product
                    </button>
                )}
                
                {!isSeller && (<button 
                    onClick={() => navigate("/cart")}
                    className="product-button blue-btn"
                >
                    View Cart
                </button>)}
                
                <button 
                    type="button" 
                    onClick={onCancel}
                    className="product-button red-btn"
                >
                    Back to Profile
                </button>
            </div>
            {products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div style={{ width: "100%" }}>
                    <div className="product-grid">
                        {products.map((product) => (
                            <div key={product._id} className={`product-card ${
                                !product.available || product.inventoryNumber === 0
                                ? isSeller
                                    ? "sold-out"         // visible but clickable
                                    : "sold-out-disabled" // fully blocked for buyers
                                : ""
                            }`}
                        >

                            {product.pictureURL && (
                                <div style={{ marginTop: "0.5rem" }}>
                                <img className="product-image" src={product.pictureURL} alt={product.productName} />
                                </div>
                                )}
                                <h3 className="product-title">{product.productName}</h3>
                                <p className="product-price">${product.price.toFixed(2)}</p>
                                <div className="product-category">{product.category}</div>
                                <p>In Stock: {product.inventoryNumber}</p>
                                {!isSeller && product.sellerName && (
                                    <p className="product-seller">Seller: {product.sellerName}</p>
                                )}

                                
                                
                                {isSeller && String(userId) === String(product.sellerId) && (
                                    <div style={{ marginTop: "0.5rem" }}>
                                        <button 
                                            onClick={() => navigate(`/editProduct/${product._id}`)}
                                            className="product-button "
                                        >
                                            Edit Product
                                        </button>
                                    </div>
                                )}
                                
                                {!isSeller && product.available && product.inventoryNumber > 0 && (
                                <button 
                                    onClick={() => {
                                    handleAddToCart(product)
                                    }}
                                    disabled={addingToCart[product._id]}
                                    className={`product-button ${addingToCart[product._id] ? 'disabled-btn' : 'green-btn'}`}
                                >
                                    {addingToCart[product._id] ? 'Adding...' : 'Add to Cart'}
                                </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            
        </div>
    );
}