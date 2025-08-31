import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';

const Alerts = ({ currentUser }) => {
  const [alerts, setAlerts] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [error, setError] = useState('');
  const [pipelineSuccess, setPipelineSuccess] = useState(false);

  useEffect(() => {
    if (currentUser?.userId) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser?.userId) return;

    setIsLoading(true);
    try {
      const [alertsRes, subscriptionsRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/alerts/inbox/${currentUser.userId}`),
        axios.get(`${API_BASE_URL}/api/auth/subscriptions/${currentUser.userId}`),
        axios.get(`${API_BASE_URL}/api/alerts/stats/${currentUser.userId}`)
      ]);

      const alerts = alertsRes.data.alerts || [];
      const subscriptions = subscriptionsRes.data.subscriptions || [];
      const stats = statsRes.data.stats || {};

      setAlerts(alerts);
      setSubscriptions(subscriptions);
      setStats(stats);

      // If this is the user's first visit (no alerts yet) and they have active subscriptions,
      // run the pipeline automatically for their subscribed locations
      if (alerts.length === 0 && subscriptions.length > 0) {
        await runPipelineForSubscriptions(subscriptions);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
      setError('Failed to load alerts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const runPipelineForSubscriptions = async (subscriptions) => {
    if (!subscriptions || subscriptions.length === 0) return;

    setIsRunningPipeline(true);
    setError(''); // Clear any existing errors

    try {
      console.log('🚀 Running pipeline for first-time user...');
      
      // Run pipeline for each active subscription
      const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
      
      for (const subscription of activeSubscriptions) {
        try {
          console.log(`⚙️ Running pipeline for ${subscription.parcelName}...`);
          await axios.post(`${API_BASE_URL}/api/pipeline/quick/${subscription.parcelName}`);
          console.log(`✅ Pipeline completed for ${subscription.parcelName}`);
        } catch (pipelineError) {
          console.warn(`⚠️ Pipeline failed for ${subscription.parcelName}:`, pipelineError.message);
          // Continue with other subscriptions even if one fails
        }
      }

      // Wait a moment for alerts to be generated, then reload just the alerts
      setTimeout(async () => {
        try {
          const [alertsRes, statsRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/alerts/inbox/${currentUser.userId}`),
            axios.get(`${API_BASE_URL}/api/alerts/stats/${currentUser.userId}`)
          ]);

          setAlerts(alertsRes.data.alerts || []);
          setStats(statsRes.data.stats || {});
          
          // Show success message
          setPipelineSuccess(true);
          setTimeout(() => setPipelineSuccess(false), 5000); // Hide after 5 seconds
        } catch (error) {
          console.error('Failed to reload alerts after pipeline:', error);
        }
      }, 2000);

    } catch (error) {
      console.error('Failed to run pipeline:', error);
      setError('Failed to generate initial alerts. Please refresh the page.');
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const toggleSubscription = async (parcelId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/auth/subscription/${currentUser.userId}/${parcelId}/toggle`);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
      setError('Failed to update subscription');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard:', text);
    });
  };

  const getBandColor = (band) => {
    switch (band?.toLowerCase()) {
      case 'red': return 'text-red-600 bg-red-100';
      case 'yellow': return 'text-yellow-600 bg-yellow-100';
      case 'green': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-muted">You need to sign in to view your alerts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-main">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient-primary mb-2">
            Your Alerts
          </h1>
          <p className="text-muted">
            Welcome back, {currentUser.name}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {pipelineSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
          >
            🎉 Welcome! We've analyzed your coastal areas and generated personalized alerts for you.
          </motion.div>
        )}

        {isLoading || isRunningPipeline ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sea mx-auto mb-4"></div>
              <p className="text-[var(--muted)]">
                {isRunningPipeline 
                  ? '🚀 Analyzing your coastal areas for the first time...' 
                  : 'Loading your alerts...'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats & Subscriptions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Stats Card */}
              {stats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl p-6 shadow-glow"
                >
                  <h3 className="text-lg font-semibold mb-4">Alert Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted">Total Alerts</span>
                      <span className="font-medium">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Today</span>
                      <span className="font-medium">{stats.today}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="text-center">
                        <div className="text-red-600 font-bold text-lg">{stats.byBand?.red || 0}</div>
                        <div className="text-xs text-muted">High Risk</div>
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-600 font-bold text-lg">{stats.byBand?.yellow || 0}</div>
                        <div className="text-xs text-muted">Medium Risk</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-600 font-bold text-lg">{stats.byBand?.green || 0}</div>
                        <div className="text-xs text-muted">Low Risk</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Subscriptions Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl p-6 shadow-glow"
              >
                <h3 className="text-lg font-semibold mb-4">Your Subscriptions</h3>
                <div className="space-y-3">
                  {subscriptions.map((sub, index) => (
                    <div key={sub.parcelId} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {sub.parcelName?.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-muted">{sub.location}</div>
                      </div>
                      <button
                        onClick={() => toggleSubscription(sub.parcelId)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          sub.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {sub.isActive ? 'Active' : 'Paused'}
                      </button>
                    </div>
                  ))}
                  {subscriptions.length === 0 && (
                    <p className="text-muted text-sm">No subscriptions found</p>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Alerts List */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-xl p-6 shadow-glow"
              >
                <h3 className="text-lg font-semibold mb-6">Recent Alerts</h3>
                
                {alerts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🌊</div>
                    <h4 className="text-lg font-medium mb-2">No alerts yet</h4>
                    <p className="text-muted">You'll see coastal risk alerts here when they're generated.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-[var(--border)] bg-[var(--card)] rounded-lg p-4 hover:border-[var(--sea)]/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBandColor(alert.band)}`}>
                              {alert.band?.toUpperCase()}
                            </span>
                            <div>
                              <div className="font-medium text-[var(--fg)]">{alert.location}</div>
                              <div className="text-sm text-[var(--muted)]">{formatDate(alert.generatedAt)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-[var(--fg)]">{alert.riskScore}/100</div>
                            <div className="text-xs text-[var(--muted)]">{alert.timeWindowHrs}h window</div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-sm text-[var(--muted)] mb-1">Reason:</div>
                          <div className="text-sm text-[var(--fg)]">{alert.why}</div>
                        </div>

                        {alert.smsShort && (
                          <div className="bg-[var(--card-translucent)] border border-[var(--border)] rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm flex-1 mr-3 text-[var(--fg)]">
                                <strong>SMS:</strong> {alert.smsShort}
                              </div>
                              <button
                                onClick={() => copyToClipboard(alert.smsShort)}
                                className="px-3 py-1 bg-[var(--sea)] text-white text-xs rounded hover:bg-[var(--sea-deep)] transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
