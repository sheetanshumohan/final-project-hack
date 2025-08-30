import React from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "./Button"; // Assuming Button component is available for consistent styling

const Navbar = () => {
  // useLocation hook gets the current page's path
  const location = useLocation();

  return (
    <header className="bg-[var(--card)] border-b border-[var(--border)] sticky top-0 z-50">
      <nav className="flex items-center justify-between p-4 max-w-7xl mx-auto">
        {/* Left Side: Always displays the project name, linking to the homepage */}
        <div className="flex items-center">
          <Link
            to="/"
            className="text-2xl font-bold center text-gradient-primary"
          >
            CoastalGuard AI
          </Link>
        </div>

        {/* Right Side: Conditionally displays content */}
        <div className="flex items-center gap-4">
          {/*
            This condition checks if the current path is NOT '/dashboard'.
            If it's the landing page ('/') or any other page, it will show the Dashboard button.
            If it IS the dashboard page, it will show nothing.
          */}
          {location.pathname !== "/dashboard" && (
            <Link to="/dashboard">
              <Button variant="primary">Dashboard &rarr;</Button>
            </Link>
          )}

          {/* You could add other items here that only show on the dashboard, e.g., a user avatar */}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
