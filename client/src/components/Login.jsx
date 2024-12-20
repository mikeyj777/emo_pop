import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

function Login() {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!name) {
        return;
      }
      const trimmedName = name.trim().toLowerCase();
      const res = await axios.post(`${API_BASE_URL}/api/users`, { name: trimmedName });
      const userId = res.data.userId;
      localStorage.setItem('userId', userId);
      navigate(`/dashboard/${userId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">EMO POP!</h1>
        <form onSubmit={handleSubmit}>
          <input
            className="login-input"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="login-button"
            type="submit"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;