import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import './OrdersHistory.css';

const OrdersHistory = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [orderData, setOrderData] = useState({
    pendingItems: [],
    completedItems: [],
    soldItems: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regeneratingOtp, setRegeneratingOtp] = useState(null);
  const [newOTP, setNewOTP] = useState(null);

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch('http://localhost:4345/order-history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch order history');
      const data = await response.json();
      setOrderData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const regenerateOtp = async (orderId, itemId) => {
    setRegeneratingOtp(`${orderId}-${itemId}`);
    setNewOTP(null);
    try {
      const response = await fetch('http://localhost:4345/regenerate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderId, itemId })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to regenerate OTP');
      
      // Set the new OTP
      setNewOTP({
        orderId,
        itemId,
        otp: data.rawOTP
      });

      // Refresh order history
      await fetchOrderHistory();
    } catch (err) {
      setError('Failed to regenerate OTP: ' + err.message);
    } finally {
      setRegeneratingOtp(null);
    }
  };

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    fetchOrderHistory();
  };

  if (loading) {
    return (
      <div className="orders-history">
        <h2>Order History</h2>
        <p className="no-orders">Loading order history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-history">
        <h2>Order History</h2>
        <div className="error-message">
          <AlertCircle className="error-icon" />
          <p>Error loading order history: {error}</p>
          <button className="retry-button" onClick={retryFetch}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderOrderItems = (items) => {
    if (items.length === 0) {
      return <p className="no-orders">No orders found</p>;
    }

    return items.map((item, index) => {
      // Check if this item has a newly generated OTP
      const newOTPForItem = newOTP && 
        newOTP.orderId === item.orderId && 
        newOTP.itemId === item.itemId;

      return (
        <div key={`${item.orderId}-${index}`} className="order-item">
          <div className="item-name">{item.name}</div>
          <div className="item-price">
            Price: {item.price}
          </div>
          <div className="item-quantity">Quantity: {item.quantity}</div>
          <div className="item-status">Status: {item.status}</div>
          {item.hashedOTP && (
            <div className="item-otp-container">
              <div className="item-otp">
                {newOTPForItem ? (
                  <div className="new-otp-alert">
                    New OTP: {newOTP.otp}
                    <span className="new-otp-note">(Please note this OTP)</span>
                  </div>
                ) : (
                  `OTP: ${item.hashedOTP}`
                )}
              </div>
              {activeTab === 'pending' && (
                <button
                  className={`regenerate-otp-button ${regeneratingOtp === `${item.orderId}-${item.itemId}` ? 'loading' : ''}`}
                  onClick={() => regenerateOtp(item.orderId, item.itemId)}
                  disabled={regeneratingOtp === `${item.orderId}-${item.itemId}`}
                >
                  <RefreshCw className={`regenerate-icon ${regeneratingOtp === `${item.orderId}-${item.itemId}` ? 'spinning' : ''}`} />
                  Regenerate OTP
                </button>
              )}
            </div>
          )}
          <div>Transaction ID: {item.transactionId}</div>
          {item.seller && <div>Seller: {item.seller.email}</div>}
          <div>
            Order Date: {new Date(item.orderDate).toLocaleDateString()}
          </div>
        </div>
      );
    });
  };

  return (
    <div className="orders-history">
      <h2>Order History</h2>
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Orders ({orderData.pendingItems.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed Orders ({orderData.completedItems.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'sold' ? 'active' : ''}`}
          onClick={() => setActiveTab('sold')}
        >
          Sold Items ({orderData.soldItems.length})
        </button>
      </div>
      <div className="order-card">
        {activeTab === 'pending' && renderOrderItems(orderData.pendingItems)}
        {activeTab === 'completed' && renderOrderItems(orderData.completedItems)}
        {activeTab === 'sold' && renderOrderItems(orderData.soldItems)}
      </div>
    </div>
  );
};

export default OrdersHistory;