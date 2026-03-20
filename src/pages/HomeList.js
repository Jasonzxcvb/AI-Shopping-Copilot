import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../components/css/style.css';
import logo from '../assets/image/logo.png';

const HomeList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err.message);
        setError('Failed to fetch product list');
        setLoading(false);
      }
    };

    fetchProducts();

    // Check login state and user role
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user'); // Remove user session
    setUser(null); // Reset user state
    navigate('/'); // Redirect to home
  };

  // Filtering logic for category and search
  useEffect(() => {
    let updatedProducts = products;

    if (category !== 'all') {
      updatedProducts = updatedProducts.filter(
        (product) => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (searchQuery) {
      updatedProducts = updatedProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(updatedProducts);
  }, [category, searchQuery, products]);

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="power">
      {/* Header Section */}
      <div className="menu">
        <div className="menucenter">
          <div className="menus">
            <img src={logo} alt="Logo" />
          </div>
          <div className="menus">
            <input
              type="text"
              placeholder="Search by name or brand..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button>Search</button>
          </div>
          <div className="menus">
            <ul>
              <li><Link to="/">Home</Link></li>
              {user ? (
                <>
                  {user.role === 'admin' ? (
                    <>
                      <li><Link to="/profile-management">Profile Management</Link></li>
                      <li><Link to="/products-management">Products Management</Link></li>
                      <li><Link to="/order-management">Order Management</Link></li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/profile-management">Profile Management</Link></li>
                      <li><Link to="/order-history">Order History</Link></li>
                    </>
                  )}
                  <li>
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link to="/login">Sign In</Link></li>
                  <li><Link to="/signup">Sign Up</Link></li>
                </>
              )}
              {user && user.role !== 'admin' && <li><Link to="/cart">Cart</Link></li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <label htmlFor="category">Filter by Category: </label>
        <select id="category" value={category} onChange={handleCategoryChange}>
          <option value="all">All</option>
          <option value="laptops">Laptops</option>
          <option value="desktops">Desktops</option>
          <option value="monitors">Monitors</option>
          <option value="accessories">Accessories</option>
        </select>
      </div>

      {/* Product List Section */}
      <div className="productlist">
        <ul>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <li key={product.productId}>
                {user && user.role === 'admin' ? (
                  <div>
                    <img src={product.imageUrl} alt={product.name} />
                    <p>{product.name}</p>
                  </div>
                ) : (
                  <Link to={`/product/${product.productId}`}>
                    <img src={product.imageUrl} alt={product.name} />
                    <div>
                      <p>{product.name}</p>
                      <p>${product.price.toFixed(2)}</p>
                    </div>
                  </Link>
                )}
              </li>
            ))
          ) : (
            <p>No products available for the selected criteria.</p>
          )}
        </ul>
      </div>

      {/* Footer Section */}
      <div className="foot">
        <p>Welcome to the computer store</p>
        <p>2024 The website copyright belongs to the author</p>
      </div>
    </div>
  );
};

export default HomeList;
