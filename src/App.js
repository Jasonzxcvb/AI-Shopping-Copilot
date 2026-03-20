import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import HomeList from './pages/HomeList';
import ProductDetail from './pages/Detail';
import ShoppingCart from './pages/Cart';
import Pay from './pages/Pay';
import SignUp from './pages/SignUp';


const App = () => {
  return (
    <CartProvider> {/* Wrap the entire application */}
      <Router>
          <Route path="/" element={<HomeList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/pay" element={<Pay />} />
      </Router>
    </CartProvider>
  );
};

export default App;
