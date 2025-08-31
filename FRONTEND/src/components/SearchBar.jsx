// src/components/SearchBar.jsx

import { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full group">
      <div className="relative">
        {/* Location icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <svg
            className="h-5 w-5 text-[var(--muted)] group-focus-within:text-[var(--sea)] transition-colors duration-200"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.976 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.274 1.765 11.842 11.842 0 00.976.573c.123.064.27.127.422.185.013.005.026.009.039.014a5.741 5.741 0 00.281.14l.038.015.026.01.014.006.004.002zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        <input
          type="search"
          name="search"
          id="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="block w-full rounded-xl border-0 bg-[var(--card)] py-3.5 pl-12 pr-16 text-[var(--fg)] ring-1 ring-inset ring-[var(--border)] placeholder:text-[var(--muted)] focus:ring-2 focus:ring-[var(--sea)] focus:ring-offset-0 focus:border-0 transition-all duration-200 sm:text-sm shadow-lg hover:shadow-xl"
          placeholder="Search coastal location (e.g., Sundarban_Delta)"
          aria-label="Search by location"
        />
        
        {/* Search button */}
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-4 group/btn"
        >
          <div className="bg-[var(--sea)] hover:bg-[var(--mangrove)] text-white p-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </button>
        
        {/* Subtle glow effect on focus */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-[var(--sea)]/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
      </div>
    </form>
  );
};

export default SearchBar;