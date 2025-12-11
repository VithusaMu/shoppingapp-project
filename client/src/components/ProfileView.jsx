// In your ProfileView component

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function ProfileView() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState("");
  
  // Fetch user session as you were doing before
  React.useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);
  
  // Add a new effect to fetch orders
  useEffect(() => {
    if (user && user.role === "customer") {
      fetchOrders();
    }
  }, [user]);
  
  // Fetch orders with improved error handling
  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      console.log("Fetching orders...");
      
      const response = await fetch("http://localhost:3000/order", {
        credentials: "include",
      });
      
      console.log("Orders response status:", response.status);
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      
      const responseText = await response.text();
      console.log("Orders response text:", responseText);
      
      try {
        const data = JSON.parse(responseText);
        console.log("Orders data:", data);
        
        if (data.payload && Array.isArray(data.payload)) {
          setOrders(data.payload);
        } else {
          console.error("Invalid orders data format:", data);
          setOrderError("Received invalid orders data format");
        }
      } catch (parseError) {
        console.error("Error parsing orders response:", parseError);
        setOrderError("Error parsing orders data");
      }
    } catch (err) {
      console.error("Error in fetchOrders:", err);
      setOrderError(`Error loading orders: ${err.message}`);
    } finally {
      setIsLoadingOrders(false);
    }
  };
  
  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1 id="username">User: {user.name || user.username}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
     

     
    <div className="profile-actions">
      <button onClick={() => navigate("/products")} className="profile-btn green">
        Browse Products
      </button>
      <button onClick={() => navigate(`/editProfile`)} className="profile-btn blue">
        Edit Profile
      </button>
      <button onClick={handleLogout} className="profile-btn red">
        Log out
      </button>
    </div>

    {user.role === "customer" && (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
    <button onClick={() => navigate("/cart")} className="profile-btn orange">
      Cart
    </button>
    </div>)}
      {/* Orders section - only for customers */}
      {user.role === "customer" && (
        <div style={{ marginTop: '30px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h2 style={{ margin: 0 }}>Your Orders</h2>
            <button
              onClick={fetchOrders}
              disabled={isLoadingOrders}
              style={{
                padding: '5px 10px',
                backgroundColor: '#333',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '4px',
                cursor: isLoadingOrders ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoadingOrders ? 'Refreshing...' : 'Refresh Orders'}
            </button>
          </div>
          
          {orderError && (
            <div style={{ color: 'red', marginBottom: '15px' }}>
              {orderError}
            </div>
          )}
          
          {isLoadingOrders ? (
            <div>Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div>You haven't placed any orders yet.</div>
          ) : (
            <div>
              {orders.map(order => (
                <div 
                  key={order._id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px',
                    backgroundColor: '#333',
                    color: 'white'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    borderBottom: '1px solid #555',
                    paddingBottom: '10px'
                  }}>
                    <div>
                      <strong>Order ID:</strong> {typeof order._id === 'string' ? 
                        order._id : 
                        (order._id ? order._id.toString() : 'Unknown')}
                    </div>
                    <div>
                      <strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Total:</strong> ${order.totalOrderPrice.toFixed(2)}
                    </div>
                  </div>
                  
                  <h3 style={{ marginBottom: '10px' }}>Products Ordered:</h3>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '15px'
                  }}>
                    {order.productsInOrder.map(item => (
                      <div 
                        key={item.productId}
                        style={{
                          backgroundColor: '#444',
                          padding: '15px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px'
                        }}
                      >
                        {/* Product Image */}
                        <div style={{ 
                          width: '80px', 
                          height: '80px', 
                          flexShrink: 0,
                          borderRadius: '4px',
                          overflow: 'hidden',
                          backgroundColor: '#333',
                          border: '1px solid #555'
                        }}>
                          {item.productDetails?.pictureURL ? (
                            <img 
                              src={item.productDetails.pictureURL} 
                              alt={item.productDetails.productName} 
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              color: '#999'
                            }}>
                              No Image
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 5px 0' }}>
                            {item.productDetails?.productName || "Unknown Product"}
                          </h4>
                          {item.productDetails?.category && (
                            <div style={{ 
                              display: 'inline-block',
                              backgroundColor: '#555',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              marginBottom: '5px'
                            }}>
                              {item.productDetails.category}
                            </div>
                          )}
                          {item.productDetails?.price && (
                            <p style={{ margin: '5px 0' }}>
                              ${item.productDetails.price.toFixed(2)} each
                            </p>
                          )}
                        </div>
                        
                        {/* Quantity & Subtotal */}
                        <div style={{ 
                          textAlign: 'right',
                          paddingLeft: '10px',
                          borderLeft: '1px solid #555'
                        }}>
                          <div style={{ fontSize: '14px', color: '#ccc' }}>
                            Quantity: {item.productQuantity}
                          </div>
                          {item.productDetails?.price && (
                            <div style={{ 
                              marginTop: '5px',
                              fontWeight: 'bold',
                              color: '#4CAF50'
                            }}>
                              Subtotal: ${(item.productDetails.price * item.productQuantity).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
  </div>
  );
}