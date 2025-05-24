// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Landing from './pages/Landing';
import Startup from './pages/Startup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './utils/ThemeContext';
import { AuthProvider } from './utils/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Startup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            {/* Add any additional routes here */}
            <Route path="/about" element={<Landing />} /> {/* Placeholder for About page */}
            <Route path="/privacy" element={<Landing />} /> {/* Placeholder for Privacy page */}
            <Route path="/terms" element={<Landing />} /> {/* Placeholder for Terms page */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <ToastContainer 
          position="top-right" 
          autoClose={5000}
          aria-label="Notifications"
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 