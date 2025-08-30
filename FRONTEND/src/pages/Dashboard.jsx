import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import AlertCard from "../components/AlertCard";
import Footer from "../components/Footer";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

const Dashboard = () => {
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Backend API configuration
  const API_BASE_URL = "http://localhost:4000";
  
  // Available Indian coastal parcel names
  const availableParcels = [
    "Sundarban_Delta", "Chilika_Block", "Mandvi_Coast",
    "Rameswaram_Belt", "Konark_Shore", "Malpe_Port", 
    "Devbhumi_Creek", "Nagapattinam_Bay", "Machilipatnam_Block"
  ];

  useEffect(() => {
    // Load a default parcel on page load
    loadDefaultParcel();
  }, []);

  const loadDefaultParcel = async () => {
    try {
      // Load default parcel (Sundarban_Delta) on page load
      await runPipeline("Sundarban_Delta");
    } catch (error) {
      console.error("Failed to load default parcel:", error);
    }
  };

  // Function to call backend pipeline API
  const runPipeline = async (parcelName) => {
    setIsLoading(true);
    setSearchError("");
    setSearchResult(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/pipeline/quick/${parcelName}`,
        {
          timeWindowHrs: 12,
          audience: ["people", "officials"]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      if (response.data.success) {
        setSearchResult(response.data);
        setLastUpdated(response.data.riskEvent.generatedAt);
        setSearchError("");
      } else {
        setSearchError("Pipeline failed: " + (response.data.errors?.join(", ") || "Unknown error"));
      }
    } catch (error) {
      console.error("Pipeline error:", error);
      
      if (error.code === 'ECONNREFUSED') {
        setSearchError("Cannot connect to backend server. Please ensure the backend is running on port 4000.");
      } else if (error.response?.status === 404) {
        setSearchError(`Parcel "${parcelName}" not found. Available parcels: ${availableParcels.join(", ")}`);
      } else if (error.response?.status === 409) {
        setSearchError("Module dependency error. Please ensure all required modules are set up.");
      } else {
        setSearchError(`Error: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!query || !query.trim()) {
      setSearchError("Please enter a parcel name");
      return;
    }

    const parcelName = query.trim();
    
    // Check if it's a valid parcel name format or suggest available ones
    if (!availableParcels.some(p => p.toLowerCase().includes(parcelName.toLowerCase()))) {
      setSearchError(
        `Parcel "${parcelName}" not found. Available parcels: ${availableParcels.join(", ")}`
      );
      return;
    }

    // Find exact match or best match
    const exactMatch = availableParcels.find(p => 
      p.toLowerCase() === parcelName.toLowerCase()
    );
    const partialMatch = availableParcels.find(p => 
      p.toLowerCase().includes(parcelName.toLowerCase())
    );

    const targetParcel = exactMatch || partialMatch;
    
    if (targetParcel) {
      await runPipeline(targetParcel);
    } else {
      setSearchError(`No matching parcel found for "${parcelName}"`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg)]">
      <Navbar />
      <motion.main
        className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* --- Header --- */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between md:items-center gap-4"
        >
          <h1 className="text-3xl font-bold text-[var(--fg)]">
            Blue Carbon Dashboard
          </h1>
          <div className="w-full md:w-80">
            <SearchBar onSearch={handleSearch} />
          </div>
        </motion.div>

        {/* --- Results Area --- */}
        <motion.div variants={itemVariants} className="flex-1">
          {/* Loading State */}
          {isLoading && (
            <div className="card-surface p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                <p className="text-[var(--muted)]">
                  Running coastal risk analysis pipeline...
                </p>
              </div>
            </div>
          )}

          {/* Success Result */}
          {searchResult && !isLoading && <AlertCard data={searchResult} />}
          
          {/* Error State */}
          {searchError && !isLoading && (
            <div className="card-surface p-8 text-center">
              <div className="flex flex-col gap-4">
                <div className="text-red-500 text-lg">⚠️ Error</div>
                <p className="text-[var(--muted)]">{searchError}</p>
                <div className="text-sm text-[var(--muted)] mt-4">
                  <p><strong>Available parcels:</strong></p>
                  <p>{availableParcels.join(", ")}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Initial State */}
          {!searchResult && !searchError && !isLoading && (
            <div className="card-surface p-8 text-center text-[var(--muted)]">
              <div className="flex flex-col gap-4">
                <p>
                  Search for a parcel to run coastal risk analysis.
                </p>
                <div className="text-sm">
                  <p><strong>Try these parcels:</strong></p>
                  <p className="text-[var(--primary)]">
                    {availableParcels.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.main>
      <Footer timestamp={lastUpdated} />
    </div>
  );
};

export default Dashboard;
