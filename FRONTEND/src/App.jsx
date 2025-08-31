import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import Alerts from "./pages/Alerts";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is already signed in (simple cookie check)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleSignIn = (userData) => {
    setCurrentUser(userData.user);
    localStorage.setItem('currentUser', JSON.stringify(userData.user));
    
    // Redirect to alerts page after sign in
    window.location.href = '/alerts';
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  return (
    <div className="relative z-0">
      <div className="relative z-10">
        <Routes>
          <Route path="/" element={<Landing currentUser={currentUser} onSignOut={handleSignOut} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
          <Route path="/alerts" element={<Alerts currentUser={currentUser} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
