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
    <div className="group glassmorphism p-8 rounded-xl shadow-lg tilt-card h-full border border-[var(--border)] hover:border-[var(--sea)]/50 transition-all duration-300 hover:shadow-2xl relative overflow-hidden">
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--sea)]/5 to-[var(--mangrove)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-[var(--sea)] rounded-full animate-pulse" />
          <h3 className="text-xl font-bold text-gradient-primary group-hover:scale-105 transition-transform duration-300">{title}</h3>
        </div>
        
        <p className="text-base text-[var(--muted)] leading-relaxed">{description}</p>
        
        {/* Bottom accent line */}
        <div className="mt-6 h-1 w-0 group-hover:w-full bg-gradient-to-r from-[var(--sea)] to-[var(--mangrove)] transition-all duration-500 rounded-full" />
      </div>
    </div>
  );
};

export default Card;
