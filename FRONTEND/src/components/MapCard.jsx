// src/components/MapCard.jsx

import React from "react";

// --- SVG Map Placeholder ---
const MapPlaceholder = () => (
  <svg
    className="w-full h-full"
    viewBox="0 0 200 100"
    preserveAspectRatio="xMidYMid slice"
  >
    <path d="M0,70 Q50,90 100,70 T200,70 L200,100 L0,100 Z" fill="var(--bg)" />
    <path
      d="M0,70 Q50,90 100,70 T200,70"
      stroke="var(--primary)"
      strokeWidth="0.5"
      fill="none"
    />
  </svg>
);

const MapCard = ({ locations, onMarkerClick, selectedLocationId }) => {
  const bandClasses = {
    red: "fill-red-400",
    yellow: "fill-yellow-400",
    green: "fill-green-400",
  };

  // NOTE: Simple positioning for demo purposes. A real map would use geo-coordinates.
  const getPosition = (coords) => ({
    left: `${(coords[1] - 87.1) * 100}%`,
    top: `${(21.7 - coords[0]) * 100}%`,
  });

  return (
    <div className="card-surface h-full min-h-[400px] p-2 flex flex-col">
      <h3 className="text-lg font-semibold text-[var(--fg)] p-4">
        Live Coastal Risk Map
      </h3>
      <div className="flex-1 bg-[var(--border)] rounded-md relative overflow-hidden">
        <MapPlaceholder />
        {locations.map((loc) => (
          <button
            key={loc.id}
            className="absolute w-4 h-4 -ml-2 -mt-2 transform"
            style={getPosition(loc.coords)}
            onClick={() => onMarkerClick(loc.id)}
            aria-label={`View details for ${loc.location}`}
          >
            <svg viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                className={`stroke-2 ${bandClasses[loc.module4.band]} ${
                  selectedLocationId === loc.id
                    ? "stroke-white"
                    : "stroke-transparent"
                }`}
              />
              <circle
                cx="12"
                cy="12"
                r="6"
                className={bandClasses[loc.module4.band]}
              />
            </svg>
          </button>
        ))}
        {/* --- Selected Location Popup --- */}
        {locations.find((l) => l.id === selectedLocationId) && (
          <div
            className="absolute card-surface p-2 rounded-md shadow-lg text-xs"
            style={{
              ...getPosition(
                locations.find((l) => l.id === selectedLocationId).coords
              ),
              transform: "translate(10px, -10px)",
            }}
          >
            <p className="font-bold">
              {locations.find((l) => l.id === selectedLocationId).location}
            </p>
            <p className="muted">
              Risk:{" "}
              {
                locations.find((l) => l.id === selectedLocationId).module4
                  .riskScore
              }
            </p>
            <a href="#" className="text-[var(--primary)] font-semibold">
              View &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapCard;
