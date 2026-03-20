import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../components/css/style.css';

const SignUp = () => {
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate input fields
    if (!formData.username || !formData.password || !formData.email) {
      setError('All fields are required.');
      return;
    }

    try {
      // Check if username already exists
      const checkResponse = await axios.get(`http://localhost:5000/api/users/exists/${formData.username}`);
      if (checkResponse.data.exists) {
        setError('Username already exists. Please choose a different one.');
        return;
      }

      // Sign up the user
      await axios.post('http://localhost:5000/api/users/signup', formData);
      setSuccess('Signup successful! Redirecting to the home page...');

      // Redirect to the home page after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError('An error occurred during signup. Please try again.');
    }
  };

  return (
    <div className="signup-container form-container">
      <form onSubmit={handleFormSubmit} className="signup-form">
        <h2>Sign Up</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
