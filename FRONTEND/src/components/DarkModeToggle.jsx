import React, { useState } from "react";

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Activate light mode" : "Activate dark mode"}
      title={isDarkMode ? "Activate light mode" : "Activate dark mode"}
      className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[hsl(var(--background))] focus:ring-[hsl(var(--primary))]"
      style={{
        backgroundColor: isDarkMode
          ? "hsl(var(--primary))"
          : "hsl(var(--card-bg))",
      }}
    >
      <span
        className="inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out"
        style={{
          transform: isDarkMode ? "translateX(22px)" : "translateX(2px)",
        }}
      />
    </button>
  );
};

export default DarkModeToggle;
