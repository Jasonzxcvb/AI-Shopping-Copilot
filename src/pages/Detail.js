import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../components/css/style.css';
import logo from '../assets/image/logo.png';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch product details:', err.message);
        setError('Failed to fetch product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cartItems.findIndex((item) => item.productId === product.productId);

    if (existingProductIndex !== -1) {
      cartItems[existingProductIndex].quantity += quantity;
    } else {
      cartItems.push({
        productId: product.productId,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cartItems));
    alert(`${product.name} has been added to your cart.`);
  };

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => quantity > 1 && setQuantity((prev) => prev - 1);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>No product found</p>;

  return (
    <div className="power">
      <div className="menu">
        <div className="menucenter">
          <div className="menus">
            <img src={logo} alt="Logo" />
          </div>
          <div className="menus">
            <input type="text" placeholder="Search..." />
            <button>Search</button>
          </div>
          <div className="menus">
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/login">Sign in</a></li>
              <li><a href="/cart">Cart</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="product-detail">
        <img src={product.imageUrl} alt={product.name} />
        <div className="content">
          <h1>{product.name}</h1>
          <p>Price: ${product.price.toFixed(2)}</p>
          <p>Stock: {product.stock}</p>
          <p>Description: {product.description}</p>
          <p>Category: {product.category}</p>
          <p>Brand: {product.brand}</p>
          <div className="quantity-control">
            Qty:
            <button onClick={handleDecrement} disabled={quantity <= 1}>-</button>
            <span>{quantity}</span>
            <button onClick={handleIncrement}>+</button>
          </div>
          <button onClick={handleAddToCart} className="addcart">Add to Cart</button>
        </div>
      </div>

      <div className="foot">
        <p>Welcome to the computer store</p>
        <p>2024 The website copyright belongs to the author</p>
      </div>
    </div>
  );
};

export default ProductDetail;
