import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { colors, fonts } from './theme';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import Menu from './pages/Menu';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Admin from './pages/Admin';
import Orders from './pages/Orders';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { useEffect, useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <div style={{ background: colors.background, minHeight: '100vh', fontFamily: fonts.body }}>
            <Navbar />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/menu" element={<PrivateRoute><Menu /></PrivateRoute>} />
              <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute adminOnly={true}><Admin /></PrivateRoute>} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

function PrivateRoute({ children, adminOnly }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (adminOnly && payload.role !== 'admin') return <Navigate to="/menu" />;
    return children;
  } catch {
    return <Navigate to="/" />;
  }
}

export default App;
