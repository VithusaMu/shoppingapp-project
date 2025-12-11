// src/Components/CartView.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #555', 
    marginBottom: '10px'
  },
   navButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginTop: '25px'
  },
  profileButton: {
    padding: '10px 20px',
    backgroundColor: '#9c27b0',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  itemImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginRight: '15px',
    border: '1px solid #555'
  },
  itemDetails: {
    flex: 1
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 15px'
  },
  quantityButton: {
    width: '30px',
    height: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50', 
    color: 'white', 
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  quantityDisplay: {
    backgroundColor: '#333', 
    color: 'white', 
    padding: '5px 10px',
    borderRadius: '4px',
    minWidth: '30px',
    textAlign: 'center'
  },
  itemTotal: {
    minWidth: '80px',
    textAlign: 'right',
    backgroundColor: '#333', 
    color: 'white', 
    padding: '5px 10px',
    borderRadius: '4px'
  },
  removeButton: {
    padding: '8px 15px',
    backgroundColor: '#f44336', 
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
    fontWeight: 'bold'
  },
  summary: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#333', 
    color: 'white', 
    borderRadius: '8px',
    border: '1px solid #555' 
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #555',
    marginBottom: '10px'
  },
  summaryTotal: {
    fontSize: '1.2em',
    fontWeight: 'bold',
    color: '#4CAF50' 
  },
  checkoutButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50', 
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '20px auto',
    display: 'block',
    width: '80%',
    maxWidth: '300px'
  },
  continueButton: {
    padding: '10px 20px',
    backgroundColor: '#2196F3', 
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '10px auto',
    display: 'block'
  }
};

export default function CartView() {
  const [cartData, setCartData] = useState({ items: [], total: 0 });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [processingItem, setProcessingItem] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();
  
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:3000/cart", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      
      const data = await response.json();
      setCartData(data.payload);
    } catch (err) {
      setError(`Error loading cart: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCart();
  }, []);
  
  const updateQuantity = async (productId, newQuantity) => {
    try {
      setProcessingItem(productId);
      
      const response = await fetch(`http://localhost:3000/cart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update cart");
      }
      
      const data = await response.json();
      setCartData(data.payload);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setProcessingItem(null);
    }
  };
const handleCheckout = async () => {
  try {
    setIsCheckingOut(true);
    console.log("Starting checkout process...");
    
    // Calculate the total price including tax
    const totalPrice = cartData.total + (cartData.total * 0.05);
    console.log("Sending order with total price:", totalPrice);
    
    // Call the placeOrder API endpoint with the total price
    const response = await fetch('http://localhost:3000/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        totalOrderPrice: totalPrice
      }),
      credentials: 'include',
    });
    
    console.log("Response status:", response.status);
    
    // Get the full text of the response before parsing
    const responseText = await response.text();
    console.log("Response text:", responseText);
    
    // Parse the response if it's valid JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("Parsed response data:", data);
    } catch (parseError) {
      console.error("Error parsing response as JSON:", parseError);
      throw new Error("Invalid response from server: " + responseText);
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to place order');
    }
    
    // Show a success message
    alert('Order placed successfully!');
    
    // Navigate to profile page to see the order
    setTimeout(() => {
      navigate('/profile');
    }, 500);
    
  } catch (error) {
    console.error("Error in checkout:", error);
    alert(`Error placing order: ${error.message}`);
  } finally {
    setIsCheckingOut(false);
  }
};
  const removeItem = async (productId) => {
    try {
      setProcessingItem(productId);
      
      const response = await fetch(`http://localhost:3000/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove item");
      }
      
      const data = await response.json();
      setCartData(data.payload);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setProcessingItem(null);
    }
  };
  
  if (isLoading) return <div style={styles.container}>Loading your cart...</div>;
  
  if (error) return <div style={{ ...styles.container, color: 'red' }}>{error}</div>;
  
  return (
    <div style={styles.container}>
      <h1>Your Shopping Cart</h1>
      
      {!cartData.items || cartData.items.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <button
            onClick={() => navigate('/products')}
            style={styles.continueButton}
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div>
          {cartData.items.map(item => (
            <div key={item.productId} style={styles.cartItem}>
              {item.product.pictureURL && (
                <img 
                  src={item.product.pictureURL} 
                  alt={item.product.productName} 
                  style={styles.itemImage}
                />
              )}
              
              <div style={styles.itemDetails}>
                <h3>{item.product.productName}</h3>
                <p>${item.product.price?.toFixed(2)} each</p>
                {item.product.inventoryNumber < 5 && (
                  <p style={{ color: '#ff6b6b', fontSize: '0.9em', fontWeight: 'bold' }}>
                    Only {item.product.inventoryNumber} left in stock!
                  </p>
                )}
              </div>
              
              <div style={styles.quantityControl}>
                <button 
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  disabled={processingItem === item.productId}
                  style={{
                    ...styles.quantityButton,
                    backgroundColor: processingItem === item.productId ? '#999' : '#4CAF50'
                  }}
                >
                  -
                </button>
                <div style={styles.quantityDisplay}>
                  {item.quantity}
                </div>
                <button 
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  disabled={processingItem === item.productId || item.quantity >= item.product.inventoryNumber}
                  style={{
                    ...styles.quantityButton,
                    backgroundColor: (processingItem === item.productId || item.quantity >= item.product.inventoryNumber) 
                      ? '#999' 
                      : '#4CAF50'
                  }}
                >
                  +
                </button>
              </div>
              
              <div style={styles.itemTotal}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>
              
              <button 
                onClick={() => removeItem(item.productId)}
                disabled={processingItem === item.productId}
                style={{
                  ...styles.removeButton,
                  opacity: processingItem === item.productId ? 0.7 : 1
                }}
              >
                Remove
              </button>
            </div>
          ))}
          
          <div style={styles.summary}>
            <h2>Order Summary</h2>
            <div style={styles.summaryRow}>
              <span>Subtotal ({cartData.items.reduce((total, item) => total + item.quantity, 0)} items):</span>
              <span style={styles.summaryTotal}>${cartData.total.toFixed(2)}</span>
            </div>
            
            <div style={styles.summaryRow}>
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            
            <div style={styles.summaryRow}>
              <span>Tax:</span>
              <span>${(cartData.total * 0.05).toFixed(2)}</span>
            </div>
            
            <div style={{...styles.summaryRow, borderBottom: 'none', marginTop: '15px'}}>
              <span style={{fontSize: '1.2em', fontWeight: 'bold'}}>Total:</span>
              <span style={{fontSize: '1.2em', fontWeight: 'bold', color: '#4CAF50'}}>
                ${(cartData.total + (cartData.total * 0.05)).toFixed(2)}
              </span>
            </div>
            
            <button
           style={{
    ...styles.checkoutButton,
    backgroundColor: isCheckingOut ? '#999' : '#4CAF50',
    cursor: isCheckingOut ? 'not-allowed' : 'pointer',
  }}
  onClick={handleCheckout}
  disabled={isCheckingOut}
>
  {isCheckingOut ? 'Processing...' : 'Place Order'}
            </button>
          </div>
          
        <div style={styles.navButtons}>
        <button
          onClick={() => navigate('/profile')}
          style={styles.profileButton}
        >
          Back to Profile
        </button>
        
        <button
          onClick={() => navigate('/products')}
          style={styles.continueButton}
        >
          Continue Shopping
        </button>
      </div>
    </div>
      )}
    </div>
  );
}