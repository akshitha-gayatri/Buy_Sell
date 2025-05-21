import React, { useEffect, useState } from "react";
import "./DeliveryItemsPage.css";
import axios from "axios";

const DeliveryItemsPage = () => {
  const [deliveryItems, setDeliveryItems] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchDeliveryItems();
  }, []);

  const fetchDeliveryItems = async () => {
    try {
      const response = await axios.get("http://localhost:4345/deliver-items", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setDeliveryItems(response.data);
    } catch (error) {
      console.error("Error fetching delivery items:", error);
      alert("Failed to load delivery items. Please try again.");
    }
  };

  const handleDeliveryCompletion = async (itemId, orderId, otp) => {
    if (!otp) {
      alert("Please enter the OTP");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4345/deliver-items/complete",
        { itemId, orderId, otp },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      setSuccessMessage(response.data.message);
      fetchDeliveryItems();
    } catch (error) {
      if (error.response?.data?.message) {
        alert("Failed to complete delivery: " + error.response.data.message);
      } else {
        alert("Failed to complete delivery: " + error.message);
      }
    }
  };

  const DeliveryItemCard = ({ item }) => {
    const [otp, setOtp] = useState("");

    return (
      <div className="delivery-item-card">
        <h3>{item.itemName}</h3>
        <p>Transaction ID: {item.transactionId}</p>
        <p>Buyer: {item.buyerName}</p>
        <p>Quantity: {item.quantity}</p>
        <div className="otp-section">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button 
            className="delivery-button"
            onClick={() => {
              handleDeliveryCompletion(item.itemId, item.orderId, otp);
              setOtp(""); // Clear OTP after submission
            }}
          >
            Complete Delivery
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="delivery-container">
      <h1>Delivery Items</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <div className="delivery-items-list">
        {deliveryItems.length === 0 ? (
          <p>No items for delivery.</p>
        ) : (
          deliveryItems.map((item) => (
            <DeliveryItemCard key={item.itemId} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

export default DeliveryItemsPage;