
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ItemPage.css';

const ItemPage = () => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        navigate('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const tokenCheckInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
      }
    }, 1000); 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(tokenCheckInterval);
    };
  }, [navigate]);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:4345/api/item/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setItem(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching item details:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('Please log in to add items to your cart.');
        setAddingToCart(false);
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `http://localhost:4345/cart`,
        { itemId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message || 'Item added to cart!');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setMessage('Failed to add item to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div className="item-details-container">
      <h1>{item.name}</h1>
      <div className="item-details">
        <div className="item-info">
          <p><strong>Price:</strong> ₹{item.price}</p>
          <p><strong>Category:</strong> {item.category}</p>
          <p><strong>Description:</strong> {item.description || 'No description available'}</p>
        </div>
        <div className="seller-info">
          <h2>Seller Information</h2>
          <p><strong>Name:</strong> {item.seller.firstName} {item.seller.lastName}</p>
          <p><strong>Contact:</strong> {item.seller.contactNumber}</p>
          <p><strong>Email:</strong> {item.seller.email}</p>
        </div>
      </div>
      <button
        onClick={handleAddToCart}
        disabled={addingToCart}
        className="add-to-cart-button"
      >
        {addingToCart ? 'Adding...' : 'Add to Cart'}
      </button>
      {message && <p className="feedback-message">{message}</p>}
      <button
        onClick={() => navigate('/cart')}
        className="view-cart-button"
      >
        Go to My Cart
      </button>
    </div>
  );
};

export default ItemPage;