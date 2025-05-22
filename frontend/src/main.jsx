import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Profile from './Profile.jsx';
import SearchItems from './SearchItems';
import Navbar from './Navbar'; 
import ItemPage from './ItemPage.jsx';
import MyCart from './MyCart.jsx';
import SellItems from './SellItems.jsx';
import AuthCheck from './AuthCheck.jsx';
import DeliveryItemsPage from './DeliveryItemsPage.jsx';
import OrdersHistory from './OrdersHistory.jsx';
import ChatInterface from './ChatInterface.jsx'

const ProtectedRoute = ({ children }) => {
  return (
    <AuthCheck>
      <Navbar />
      {children}
    </AuthCheck>

  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
        <Route path="/items" element={<ProtectedRoute><SearchItems /></ProtectedRoute>}/>
        <Route path="/item/:id" element={<ProtectedRoute><ItemPage /></ProtectedRoute>}/>
        <Route path="/cart" element={<ProtectedRoute><MyCart /></ProtectedRoute>}/>
        <Route path="/items/sell-items" element={<ProtectedRoute><SellItems /></ProtectedRoute>}/>
        <Route path="/deliver-items" element={<ProtectedRoute><DeliveryItemsPage /></ProtectedRoute>}/>
        <Route path="/order-history" element={<ProtectedRoute><OrdersHistory /></ProtectedRoute>}/>
        <Route path="/chat/start" element={<ProtectedRoute><ChatInterface /></ProtectedRoute>}/>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);