import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({
    name: '',
    price: 0,
    stock: 0,
    specifications: {},
    stockStatus: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products.');
      }
    };

    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingProductId(product.productId);
    setEditedProduct({
      name: product.name,
      price: product.price,
      stock: product.stock,
      specifications: product.specifications,
      stockStatus: product.stockStatus,
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:5000/api/products/${editingProductId}`, editedProduct);
      setSuccess('Product updated successfully!');
      setEditingProductId(null);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.productId === editingProductId ? { ...product, ...editedProduct } : product
        )
      );
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Failed to update product.');
    }
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      setProducts((prevProducts) => prevProducts.filter((product) => product.productId !== productId));
      setSuccess('Product deleted successfully!');
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product.');
    }
  };

  return (
    <div className="product-management">
      <h1>Product Management</h1>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Specifications</th>
            <th>Stock Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.productId}>
              <td>
                <img src={product.imageUrl} alt={product.name} style={{ width: '100px' }} />
              </td>
              {editingProductId === product.productId ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={editedProduct.name}
                      onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editedProduct.price}
                      onChange={(e) => setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={editedProduct.stock}
                      onChange={(e) => setEditedProduct({ ...editedProduct, stock: parseInt(e.target.value, 10) })}
                    />
                  </td>
                  <td>
                    <textarea
                      value={JSON.stringify(editedProduct.specifications, null, 2)} // Convert object to JSON string
                      onChange={(e) => {
                        try {
                          const parsedSpecs = JSON.parse(e.target.value); // Parse JSON back to object
                          setEditedProduct({ ...editedProduct, specifications: parsedSpecs });
                        } catch {
                          setEditedProduct({ ...editedProduct, specifications: e.target.value }); // Handle invalid JSON
                        }
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editedProduct.stockStatus}
                      onChange={(e) => setEditedProduct({ ...editedProduct, stockStatus: e.target.value })}
                    />
                  </td>
                  <td>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setEditingProductId(null)}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{product.name}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>
                    {product.specifications && (
                      <ul>
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <li key={key}>
                            <strong>{key}:</strong> {value}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td>{product.stockStatus}</td>
                  <td>
                    <button onClick={() => handleEdit(product)}>Edit</button>
                    <button onClick={() => handleDelete(product.productId)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default ProductManagement;
