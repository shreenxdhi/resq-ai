import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { AuthProvider } from './utils/AuthContext';
import './App.css';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </Router>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
