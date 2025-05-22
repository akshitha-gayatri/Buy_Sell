
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyCart.css'
const MyCart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderOTPs, setOrderOTPs] = useState([]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await axios.get('http://localhost:4345/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setCart(response.data.cart || []);
    } catch (error) {
      console.error('Detailed cart fetch error:', error);
      setError(error.response?.data?.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4345/cart/${itemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // Update cart locally
      setCart(cart.filter(item => item._id !== itemId));
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item from cart');
    }
  };

  const placeOrder = async () => {
    try {
      setPlacingOrder(true);
      setError(null);
      setOrderOTPs([]); // Reset OTPs
  
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const decodedToken = JSON.parse(atob(token.split('.')[1])); 
      const buyerId = decodedToken.id; 
  
      const orderItems = cart.map(item => ({
        itemId: item._id,
        quantity: item.quantity || 1,
        sellerId: item.sellerId 
      }));
  
      if (!orderItems || orderItems.length === 0) {
        throw new Error('Invalid items');
      }
  
      const amount = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }
  
      const response = await axios.post(
        'http://localhost:4345/place-order',
        {
          transactionId: `txn_${Date.now()}`, 
          buyerId: buyerId, 
          amount: amount,
          items: orderItems
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      if (response.status === 201) {
        setCart([]);
        localStorage.removeItem('cart');
        
        if (response.data.rawOTPs) {
          setOrderOTPs(response.data.rawOTPs);
        }
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order');
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };
        
  useEffect(() => {
    fetchCart();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const totalPrice = cart.reduce((total, item) => total + item.price, 0);

  return (
    <div>
      <div className="cart-container">
        <h1>My Cart</h1>
        {orderOTPs.length > 0 && (
          <div className="otp-display">
            <h2>One-Time Passwords (OTPs)</h2>
            {orderOTPs.map((otpInfo) => (
              <div key={otpInfo.itemId} className="otp-item">
                <p><strong>Item:</strong> {otpInfo.itemName}</p>
                <p><strong>OTP:</strong> {otpInfo.rawOTP}</p>
              </div>
            ))}
            <p className="otp-warning">
              Please note down these OTPs. They will be required during item delivery.
            </p>
          </div>
        )}
        {cart.length === 0 ? (
          <div>Your cart is empty.</div>
        ) : (
          <>
            <ul>
              {cart.map((item) => (
                <li key={item._id} className="cart-item">
                  <div>
                    <h2>{item.name}</h2>
                    <p>Price: ₹{item.price}</p>
                    <p>          
                      Seller: {item.seller ? `${item.seller.firstName} ${item.seller.lastName}` : 'Unknown'}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item._id)}
                    disabled={placingOrder}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="cart-summary">
              <h2>Total: ₹{totalPrice.toFixed(2)}</h2>
              <button 
                onClick={placeOrder} 
                disabled={placingOrder || cart.length === 0}
                className="place-order-button"
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyCart;