import React from "react";

const Card = ({ title, description, isStat = false }) => {
  if (isStat) {
    return (
      <div className="glassmorphism p-6 rounded-lg shadow-lg tilt-card">
        <h3 className="text-sm font-medium text-[var(--muted)] truncate">
          {title}
        </h3>

        <p className="mt-1 text-3xl font-semibold tracking-tight text-[var(--fg)]">
          {description}
        </p>
      </div>
    );
  }

  return (
    <div className="glassmorphism p-8 rounded-xl shadow-lg tilt-card h-full">
      <h3 className="text-xl font-bold text-gradient-primary">{title}</h3>

      <p className="mt-4 text-base text-[var(--muted)]">{description}</p>
    </div>
  );
};

export default Card;
