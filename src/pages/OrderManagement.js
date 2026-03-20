import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [productMap, setProductMap] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState('');

  useEffect(() => {
    const fetchOrdersAndDetails = async () => {
      try {
        // Fetch all orders
        const ordersResponse = await axios.get('http://localhost:5000/api/orders');
        const ordersData = ordersResponse.data;
        setOrders(ordersData);

        // Extract unique userIds and productIds
        const userIds = [...new Set(ordersData.map((order) => order.userId))];
        const productIds = [
          ...new Set(ordersData.flatMap((order) => order.items.map((item) => item.productId))),
        ];

        // Fetch user details
        const userPromises = userIds.map((userId) =>
          axios.get(`http://localhost:5000/api/users/userId/${userId}`)
        );
        const users = await Promise.all(userPromises);
        const userMap = users.reduce((acc, user) => {
          acc[user.data.userId] = user.data.username; // Map userId to username
          return acc;
        }, {});
        setUserMap(userMap);

        // Fetch product details
        const productPromises = productIds.map((productId) =>
          axios.get(`http://localhost:5000/api/products/${productId}`)
        );
        const products = await Promise.all(productPromises);
        const productMap = products.reduce((acc, product) => {
          acc[product.data.productId] = product.data.name; // Map productId to product name
          return acc;
        }, {});
        setProductMap(productMap);
      } catch (err) {
        console.error('Error fetching orders or details:', err);
        setError('Failed to fetch orders or related data.');
      }
    };

    fetchOrdersAndDetails();
  }, []);

  const handleEdit = (order) => {
    setEditingOrderId(order.orderId);
    setUpdatedStatus(order.status);
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${editingOrderId}`, {
        status: updatedStatus,
      });
      setSuccess('Order updated successfully!');
      setEditingOrderId(null);
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === editingOrderId ? { ...order, status: updatedStatus } : order
        )
      );
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Failed to update order.');
    }
  };

  return (
    <div className="order-management">
      <h1>Order Management</h1>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Status</th>
            <th>Total Amount</th>
            <th>Order Time</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{userMap[order.userId] || 'Loading...'}</td>
              {editingOrderId === order.orderId ? (
                <td>
                  <select
                    value={updatedStatus}
                    onChange={(e) => setUpdatedStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              ) : (
                <td>{order.status}</td>
              )}
              <td>${order.totalAmount.toFixed(2)}</td>
              <td>{new Date(order.timestamp).toLocaleString()}</td>
              <td>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.productId}>
                      {productMap[item.productId] || 'Loading...'} - Quantity: {item.quantity}
                    </li>
                  ))}
                </ul>
              </td>
              <td>
                {editingOrderId === order.orderId ? (
                  <>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setEditingOrderId(null)}>Cancel</button>
                  </>
                ) : (
                  <button onClick={() => handleEdit(order)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default OrderManagement;
