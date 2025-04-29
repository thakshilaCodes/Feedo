import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link to="/" className="flex items-center py-4 px-2">
                <span className="font-semibold text-gray-500 text-lg">User Management</span>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">
              Home
            </Link>
            {user && user.role === 'admin' && (
              <Link to="/admin/users" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">
                Manage Users
              </Link>
            )}
            {user && user.role === 'restaurantManager' && (
              <Link to="/restaurant" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">
                Restaurant Dashboard
              </Link>
            )}
            {user && user.role === 'deliveryPerson' && (
              <Link to="/delivery" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">
                Delivery Dashboard
              </Link>
            )}
            {user && user.role === 'customer' && (
              <Link to="/customer" className="py-4 px-2 text-gray-500 font-semibold hover:text-green-500 transition duration-300">
                Customer Dashboard
              </Link>
            )}
          </div>
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <span className="py-2 px-2 text-gray-500">Hello, {user.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="py-2 px-2 font-medium text-white bg-red-500 rounded hover:bg-red-400 transition duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-2 px-2 font-medium text-gray-500 rounded hover:bg-green-500 hover:text-white transition duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="py-2 px-2 font-medium text-white bg-green-500 rounded hover:bg-green-400 transition duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;