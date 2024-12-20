import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import EnhancedClusteringMoods from './components/EnhancedClusteringMoods';
import Login from './components/Login';
import MainDashboard from './components/MainDashboard';
import MainController from './components/MainController';
import './App.css';
import './styles/global.css';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/:userId" element={<MainDashboard />} />
          <Route path="/controller/:userId" element={<MainController />} />
          <Route path="/clustering" element={<EnhancedClusteringMoods />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;