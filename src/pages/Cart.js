import React, { useEffect, useState } from 'react';
import logo from '../assets/image/logo.png';
import '../components/css/style.css';
import { useNavigate } from 'react-router-dom';

const ShoppingCart = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    setProducts(cartItems);
    setTotal(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, []);

  useEffect(() => {
    const calcTotal = () =>
      products.reduce((sum, product) => sum + product.price * product.quantity, 0);
    setTotal(calcTotal());
  }, [products]);

  const handleCheckout = () => {
    navigate('/pay');
  };

  const handleClearCart = () => {
    if (!window.confirm('Clear all items from the cart?')) {
      return;
    }

    localStorage.removeItem('cart');
    setProducts([]);
    setTotal(0);
  };

  const handleQuantityChange = (productId, quantity) => {
    const updatedProducts = products.map((product) =>
      product.productId === productId ? { ...product, quantity: Math.max(1, quantity) } : product
    );
    setProducts(updatedProducts);
    localStorage.setItem('cart', JSON.stringify(updatedProducts));
  };

  const handleRemoveProduct = (productId) => {
    const updatedProducts = products.filter((product) => product.productId !== productId);
    setProducts(updatedProducts);
    localStorage.setItem('cart', JSON.stringify(updatedProducts));
  };

  const renderCartItems = () => (
    <ul className="cart-list">
      {products.map((product) => (
        <li key={product.productId} className="cart-item">
          <img src={product.imageUrl} alt={product.name} className="cart-item-image" />
          <span className="product-name">{product.name}</span>
          <span className="product-price">${product.price.toFixed(2)}</span>
          <input
            type="number"
            value={product.quantity}
            min="1"
            onChange={(e) => handleQuantityChange(product.productId, parseInt(e.target.value, 10))}
          />
          <button className="remove-button" onClick={() => handleRemoveProduct(product.productId)}>
            Remove
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
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

      <div className="shopping-cart">
        <div className="shopping-cart-header">
          <h1>Shopping Cart</h1>
          {products.length > 0 && (
            <button type="button" className="clear-cart-button" onClick={handleClearCart}>
              Clear Cart
            </button>
          )}
        </div>
        {products.length > 0 ? (
          <>
            {renderCartItems()}
            <div className="total">
              <span>Total: ${total.toFixed(2)}</span>
              <button onClick={handleCheckout}>Proceed to Checkout</button>
            </div>
          </>
        ) : (
          <p>Your cart is empty!</p>
        )}
      </div>

      <div className="foot">
        <p>Welcome to the computer store</p>
        <p>2024 The website copyright belongs to the author</p>
      </div>
    </div>
  );
};

export default ShoppingCart;
