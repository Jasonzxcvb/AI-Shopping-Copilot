import React, { useState, useEffect } from 'react';
import logo from '../assets/image/logo.png';
import '../components/css/style.css';
import { useNavigate } from 'react-router-dom';

const ShoppingCart = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  // 加载购物车中的产品
  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    setProducts(cartItems);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(totalAmount);
  }, []);

  const handleCheckout = () => {
    navigate('/pay');
  };  

  // 更新总价
  useEffect(() => {
    const calcTotal = () =>
      products.reduce((sum, product) => sum + product.price * product.quantity, 0);
    setTotal(calcTotal());
  }, [products]);

  // 处理产品数量更新
  const handleQuantityChange = (productId, quantity) => {
    const updatedProducts = products.map((product) =>
      product.productId === productId ? { ...product, quantity: Math.max(1, quantity) } : product
    );
    setProducts(updatedProducts);
    localStorage.setItem('cart', JSON.stringify(updatedProducts));
  };
  

  // 移除产品
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
        <h1>Shopping Cart</h1>
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
