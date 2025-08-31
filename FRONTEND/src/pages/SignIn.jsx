import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ParticleBackground from '../components/ParticleBackround';
import Button from '../components/Button';

const API_BASE_URL = 'http://localhost:4000';

const SignIn = ({ onSignIn }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    language: 'en',
    phone: '',
    role: '',
    selectedParcels: []
  });
  const [availableParcels, setAvailableParcels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: User details, 2: Select parcels

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' }
  ];

  const roles = [
    { value: '', label: 'Select Role (Optional)' },
    { value: 'fisher', label: 'Fisher / मछुआरे / માછીમાર' },
    { value: 'ngo', label: 'NGO Worker / एनजीओ कार्यकर्ता / એનજીઓ કાર્યકર' },
    { value: 'official', label: 'Government Official / सरकारी अधिकारी / સરકારી અધિકારી' }
  ];

  React.useEffect(() => {
    if (step === 2) {
      loadAvailableParcels();
    }
  }, [step]);

  const loadAvailableParcels = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/available-parcels`);
      setAvailableParcels(response.data.parcels);
    } catch (error) {
      console.error('Failed to load parcels:', error);
      setError('Failed to load available locations');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleParcelToggle = (parcelName) => {
    setFormData(prev => ({
      ...prev,
      selectedParcels: prev.selectedParcels.includes(parcelName)
        ? prev.selectedParcels.filter(p => p !== parcelName)
        : [...prev.selectedParcels, parcelName]
    }));
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (formData.selectedParcels.length === 0) {
      setError('Please select at least one location to monitor');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Sign in user
      const signInResponse = await axios.post(`${API_BASE_URL}/api/auth/signin`, {
        name: formData.name,
        email: formData.email,
        language: formData.language,
        phone: formData.phone,
        role: formData.role
      });

      if (!signInResponse.data.success) {
        throw new Error('Sign in failed');
      }

      // Subscribe to parcels
      const subscribeResponse = await axios.post(`${API_BASE_URL}/api/auth/subscribe`, {
        userId: signInResponse.data.user.userId,
        parcels: formData.selectedParcels
      });

      if (!subscribeResponse.data.success) {
        throw new Error('Subscription failed');
      }

      // Call parent callback
      if (onSignIn) {
        onSignIn({
          user: signInResponse.data.user,
          subscriptions: subscribeResponse.data.subscriptions
        });
      }

    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.response?.data?.error || 'Sign in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-glow p-8 w-full max-w-2xl backdrop-blur-sm border border-[var(--border)]"
        >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gradient-primary mb-3">
            Join Coastal Alerts
          </h1>
          <p className="text-[var(--muted)] text-lg">
            Get personalized early warnings for your coastal area
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            step >= 1 ? 'bg-[var(--sea)] text-white shadow-lg' : 'bg-[var(--muted)] text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-20 h-1 mx-3 rounded-full transition-all ${step >= 2 ? 'bg-[var(--sea)]' : 'bg-[var(--muted)]'}`}></div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            step >= 2 ? 'bg-[var(--sea)] text-white shadow-lg' : 'bg-[var(--muted)] text-gray-600'
          }`}>
            2
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 shadow-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Step 1: User Details */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--fg)]">
                Your Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--fg)] focus:ring-2 focus:ring-[var(--sea)] focus:border-[var(--sea)] transition-colors"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--fg)]">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--fg)] focus:ring-2 focus:ring-[var(--sea)] focus:border-[var(--sea)] transition-colors"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--fg)]">
                Preferred Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--fg)] focus:ring-2 focus:ring-[var(--sea)] focus:border-[var(--sea)] transition-colors"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.native} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--fg)]">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--fg)] focus:ring-2 focus:ring-[var(--sea)] focus:border-[var(--sea)] transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--fg)]">
                Your Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--card)] text-[var(--fg)] focus:ring-2 focus:ring-[var(--sea)] focus:border-[var(--sea)] transition-colors"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <Button type="submit" className="w-full">
              Next: Select Locations
            </Button>
          </form>
        )}

        {/* Step 2: Select Parcels */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[var(--fg)]">
                Select Locations to Monitor
              </h3>
              <p className="text-[var(--muted)] mb-6">
                Choose the coastal areas you want to receive alerts for:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {availableParcels.map(parcel => (
                  <label
                    key={parcel.parcelName}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                      formData.selectedParcels.includes(parcel.parcelName)
                        ? 'border-[var(--sea)] bg-[var(--sea)]/10 shadow-sm'
                        : 'border-[var(--border)] hover:border-[var(--sea)]/50 bg-[var(--card)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedParcels.includes(parcel.parcelName)}
                      onChange={() => handleParcelToggle(parcel.parcelName)}
                      className="mr-3 h-4 w-4 text-[var(--sea)] focus:ring-[var(--sea)] border-[var(--border)] rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-[var(--fg)]">
                        {parcel.parcelName.replace(/_/g, ' ')}
                      </div>
                      <div className="text-xs text-[var(--muted)]">
                        {parcel.villageName} • {parcel.areaTotal} hectares
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Setting up...' : 'Start Monitoring'}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
    </>
  );
};

export default SignIn;
