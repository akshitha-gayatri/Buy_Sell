import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SearchItems.css';

const SearchItems = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const [categories] = useState([
    'Electronics', 'Books', 'Clothing', 'Accessories',
    'Kitchen Appliances', 'Home Appliances', 'Musical Instruments'
  ]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        setCurrentUser(null);
        navigate('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    const tokenCheckInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token && currentUser) {
        setCurrentUser(null);
        navigate('/login');
      }
    }, 1000); 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(tokenCheckInterval);
    };
  }, [navigate, currentUser]);

  useEffect(() => {
    checkAuthAndFetchUser();
  }, []);

  const checkAuthAndFetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:4345/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCurrentUser(response.data._id);
      setIsLoading(false);
    } catch (error) {
      console.error('Authentication error:', error);
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  useEffect(() => {
    if (!isLoading && currentUser) {
      const debounceTimer = setTimeout(() => {
        fetchItems();
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [search, selectedCategories, isLoading, currentUser]);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:4345/api/items', {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          search: search.trim(),
          categories: selectedCategories.join(',')
        }
      });
      setItems(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      console.error('Error fetching items:', error);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleItemClick = (item) => {
    if (item.seller._id === currentUser) {
      alert("You cannot buy your own item!");
      return;
    }
    window.open(`/item/${item._id}`, '_blank');
  };

  // If user is not authenticated, render nothing
  if (!currentUser && !isLoading) {
    return null;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="search-items-container">
      <h1>IIIT Marketplace</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for items..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>
      <div className="categories-filter">
        <h3>Filter by Categories:</h3>
        {categories.map((category) => (
          <label key={category} className="category-checkbox">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
            />
            {category}
          </label>
        ))}
      </div>
      <div className="items-list">
        {items.length === 0 ? (
          <p>No items found</p>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="item-card"
              onClick={() => handleItemClick(item)}
            >
              <h3>{item.name}</h3>
              <p>Price: ₹{item.price}</p>
              <p>Seller: {item.sellerName}</p>
              <p>Category: {item.category}</p>
              {item.seller._id === currentUser && (
                <p className="own-item-warning">Your Item</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SearchItems;