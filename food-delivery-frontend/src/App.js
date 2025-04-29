import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/common/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserManagement from './components/admin/UserManagement';
import RestaurantDashboard from './components/restaurant/Dashboard';
import DeliveryDashboard from './components/delivery/Dashboard';
import CustomerDashboard from './components/customer/Dashboard';
import Home from './components/common/Home';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/delivery" element={<DeliveryDashboard />} />
              <Route path="/restaurant" element={<RestaurantDashboard />} />
              
              {/* Admin Routes */}
              <Route element={<PrivateRoute requiredRole="admin" />}>
                <Route path="/admin/users" element={<UserManagement />} />
              </Route>
              
              {/* Restaurant Manager Routes */}
              <Route element={<PrivateRoute requiredRole="restaurantManager" />}>
                <Route path="/restaurant" element={<RestaurantDashboard />} />
              </Route>
              
              {/* Delivery Person Routes */}
              <Route element={<PrivateRoute requiredRole="deliveryPerson" />}>
                <Route path="/delivery" element={<DeliveryDashboard />} />
              </Route>
              
              {/* Customer Routes */}
              <Route element={<PrivateRoute requiredRole="customer" />}>
                <Route path="/customer" element={<CustomerDashboard />} />
              </Route>
              
              {/* Common Route */}
              <Route path="/" element={<Home />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;