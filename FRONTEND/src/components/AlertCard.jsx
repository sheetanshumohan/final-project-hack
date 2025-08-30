import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Helper component for displaying key metrics with icons ---
const MetricItem = ({ icon, label, children }) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 text-[var(--muted)]">{icon}</div>
    <div className="flex-1">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="font-semibold text-[var(--fg)] mt-1">{children}</p>
    </div>
  </div>
);

const AlertCard = ({ data }) => {
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  // The component now expects the `riskEvent` object from your new data structure.
  const { riskEvent } = data;

  useEffect(() => {
    setIsAcknowledged(false);
  }, [riskEvent._id]);

  const bandClasses = {
    Red: {
      badge: "bg-[var(--danger)]/10 text-[var(--danger)]",
      text: "text-[var(--danger)]",
    },
    Yellow: {
      badge: "bg-[var(--warning)]/10 text-[var(--warning)]",
      text: "text-[var(--warning)]",
    },
    Green: {
      badge: "bg-[var(--success)]/10 text-[var(--success)]",
      text: "text-[var(--success)]",
    },
  };

  const currentBand = bandClasses[riskEvent.band] || bandClasses.Green;

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={riskEvent._id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`card-surface p-6 rounded-lg transition-opacity ${
          isAcknowledged ? "opacity-60" : ""
        }`}
        aria-live="polite"
      >
        {/* --- Card Header: At-a-glance critical info --- */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-start border-b border-[var(--border)] pb-4 mb-4">
          <div>
            <p className="text-md text-[var(--muted)]">Location</p>
            <h2 className="text-2xl font-bold text-[var(--fg)]">
              {riskEvent.location.replace(/_/g, " ")}
            </h2>
          </div>
          <div
            className={`text-right mt-2 sm:mt-0 px-4 py-2 rounded-md ${currentBand.badge}`}
          >
            <p className="text-md font-semibold">Risk Score</p>
            <p className={`text-3xl font-bold ${currentBand.text}`}>
              {riskEvent.riskScore}
              <span className="text-lg">/100</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          {/* Main Info Column */}
          <div className="md:col-span-2 ">
            <MetricItem icon={<IconCause />} label="Primary Cause">
              {<p className="text-lg">{riskEvent.why}</p>}
            </MetricItem>
            <div className="mt-4">
              <MetricItem icon={<IconMessage />} label="Dashboard Alert">
                {<p className="text-lg">{riskEvent.messages.dashboard}</p>}
              </MetricItem>
            </div>
          </div>

          {/* Metadata Column */}
          <div className="md:col-span-1 space-y-4">
            <MetricItem icon={<IconClock />} label="Time Window">
              Next {<span className="text-md">{riskEvent.timeWindowHrs}</span>}{" "}
              Hours
            </MetricItem>
            <MetricItem icon={<IconAudience />} label="Target Audience">
              <div className="flex flex-wrap gap-2">
                {riskEvent.audience.map((aud) => (
                  <span
                    key={aud}
                    className="text-sm font-medium bg-[var(--sea-deep)]/30 text-[var(--sea)] px-2 py-1 rounded"
                  >
                    {aud.charAt(0).toUpperCase() + aud.slice(1)}
                  </span>
                ))}
              </div>
            </MetricItem>
          </div>
        </div>

        <p className="text-md text-center text-[var(--muted)] mt-6">
          Generated At: {formatDate(riskEvent.generatedAt)}
        </p>

        {/* --- Action Button --- */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setIsAcknowledged(!isAcknowledged)}
            className="btn-primary w-full sm:w-auto"
          >
            {isAcknowledged ? "✔ Acknowledged" : "Acknowledge"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Self-contained SVG Icons for clarity ---
const IconCause = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const IconMessage = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);
const IconClock = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const IconAudience = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export default AlertCard;
