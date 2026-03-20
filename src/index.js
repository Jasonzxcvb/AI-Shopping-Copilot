import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeList from './pages/HomeList';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Detail from './pages/Detail';
import Pay from './pages/Pay';
import SignUp from './pages/SignUp';
import OrderHistory from './pages/OrderHistory';
import ProductsManagement from './pages/ProductManagement';
import ProfileManagement from './pages/ProfileManagement';
import OrderManagement from './pages/OrderManagement';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />       
        <Route path="/product/:id" element={<Detail />} />
        <Route path="/Pay" element={<Pay />} />
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/profile-management" element={<ProfileManagement />} /> 
        <Route path="/products-management" element={<ProductsManagement />} /> 
        <Route path="/order-history" element={<OrderHistory />} /> 
        <Route path="/order-management" element={<OrderManagement />} /> 
        {/* <Route path="/product/:id" component={Detail} />
        <Route path="/aa" element={<div>默认页面或重定向逻辑</div>} /> */}
      </Routes>
    </Router>
  );
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(

 

  <React.StrictMode>
    <App />
  </React.StrictMode>
);







// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>

// );

// reportWebVitals();





// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

