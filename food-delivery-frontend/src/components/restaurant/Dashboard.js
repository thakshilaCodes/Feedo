import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const RestaurantDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'main'
  });
  const [loading, setLoading] = useState({
    orders: true,
    menu: true
  });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, these would call your restaurant service API
        // Mock orders data
        const mockOrders = [
          {
            id: '1',
            orderId: 'ORD-12345',
            customer: "John Doe",
            items: [
              { name: "Cheeseburger", quantity: 2, price: 8.99 },
              { name: "Fries", quantity: 1, price: 3.50 }
            ],
            total: 21.48,
            status: 'pending',
            deliveryAddress: "123 Main St, Apt 4B",
            deliveryTime: '30 mins'
          },
          {
            id: '2',
            orderId: 'ORD-12346',
            customer: "Jane Smith",
            items: [
              { name: "Veggie Pizza", quantity: 1, price: 12.99 },
              { name: "Garlic Bread", quantity: 1, price: 4.50 }
            ],
            total: 17.49,
            status: 'preparing',
            deliveryAddress: "456 Oak Ave",
            deliveryTime: '45 mins'
          }
        ];

        // Mock menu items
        const mockMenuItems = [
          {
            id: '1',
            name: "Cheeseburger",
            description: "Classic cheeseburger with lettuce, tomato, and special sauce",
            price: 8.99,
            category: "main"
          },
          {
            id: '2',
            name: "Veggie Pizza",
            description: "12-inch pizza with assorted vegetables",
            price: 12.99,
            category: "main"
          },
          {
            id: '3',
            name: "Fries",
            description: "Crispy golden fries",
            price: 3.50,
            category: "side"
          }
        ];

        setOrders(mockOrders);
        setMenuItems(mockMenuItems);
        setLoading({ orders: false, menu: false });
      } catch (err) {
        setError('Failed to fetch data');
        setLoading({ orders: false, menu: false });
      }
    };
    fetchData();
  }, []);

  const handleAddMenuItem = (e) => {
    e.preventDefault();
    const newItem = {
      id: Date.now().toString(),
      ...newMenuItem,
      price: parseFloat(newMenuItem.price)
    };
    setMenuItems([...menuItems, newItem]);
    setNewMenuItem({
      name: '',
      description: '',
      price: '',
      category: 'main'
    });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMenuItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading.orders || loading.menu) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
        <div className="text-sm">
          <span className="font-medium">Restaurant:</span> {user?.restaurantInfo?.name}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Restaurant Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 mb-1"><span className="font-medium">Name:</span> {user?.restaurantInfo?.name}</p>
            <p className="text-gray-600 mb-1"><span className="font-medium">Address:</span> {user?.restaurantInfo?.address}</p>
            <p className="text-gray-600 mb-1"><span className="font-medium">Manager:</span> {user?.fullName}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1"><span className="font-medium">Email:</span> {user?.email}</p>
            <p className="text-gray-600 mb-1"><span className="font-medium">Contact:</span> {user?.contactNumber}</p>
            <p className="text-gray-600 mb-1">
              <span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                user?.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user?.isApproved ? 'Approved' : 'Pending Approval'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-3 font-medium text-sm rounded-t-lg ${
              activeTab === 'orders' 
                ? 'border-b-2 border-indigo-500 text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-2 px-3 font-medium text-sm rounded-t-lg ${
              activeTab === 'menu' 
                ? 'border-b-2 border-indigo-500 text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Menu Management
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-3 font-medium text-sm rounded-t-lg ${
              activeTab === 'analytics' 
                ? 'border-b-2 border-indigo-500 text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold p-6 pb-0">Current Orders</h2>
          {orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No orders found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4">
                      <ul className="text-sm text-gray-500">
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.quantity}x {item.name} (${item.price.toFixed(2)})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Mark as Ready
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold p-6 pb-0">Current Menu</h2>
            {menuItems.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No menu items found
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menuItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {item.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add New Menu Item</h2>
            <form onSubmit={handleAddMenuItem}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newMenuItem.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newMenuItem.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={newMenuItem.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={newMenuItem.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="main">Main Course</option>
                  <option value="side">Side Dish</option>
                  <option value="drink">Drink</option>
                  <option value="dessert">Dessert</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Menu Item
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Restaurant Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800">Total Orders</h3>
              <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-800">Completed</h3>
              <p className="text-3xl font-bold text-green-600">
                {orders.filter(o => o.status === 'completed').length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-800">Revenue</h3>
              <p className="text-3xl font-bold text-purple-600">
                ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Popular Items</h3>
            <ul className="space-y-2">
              {menuItems.map(item => (
                <li key={item.id} className="flex justify-between">
                  <span>{item.name}</span>
                  <span className="font-medium">10 orders</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;