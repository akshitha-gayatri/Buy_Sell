import React, { useState } from 'react';
import axios from 'axios';
import './SellItems.css'
const SellItems = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Electronics', 'Books', 'Clothing', 'Accessories',
    'Kitchen Appliances', 'Home Appliances', 'Musical Instruments'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    const { name, price, category } = formData;
    if (!name || !price || !category) {
      setError('Name, Price, and Category are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post('http://localhost:4345/api/sell-items', 
        formData, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSuccess('Item listed successfully!');
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: ''
      });
    } catch (error) {
      console.error('Error listing item:', error);
      setError(error.response?.data?.message || 'Failed to list item');
    }
  };

  return (
    <div>
      <div className="sell-items-container">
        <h1>List Your Item</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <textarea
            name="description"
            placeholder="Item Description (Optional)"
            value={formData.description}
            onChange={handleChange}
          />
          
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />
          
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <button type="submit">List Item</button>
        </form>
      </div>
    </div>
  );
};

export default SellItems;