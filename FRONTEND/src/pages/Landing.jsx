import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/Button";
import Card from "../components/Card";
import ParticleBackground from "../components/ParticleBackround";
import Footer from "../components/Footer";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const Landing = ({ currentUser, onSignOut }) => {
  return (
    <>
      <ParticleBackground />
      <div className="min-h-screen w-full overflow-x-hidden">
        <header className="absolute inset-x-0 top-0 z-50">
          <nav
            className="flex items-center justify-between p-6 lg:px-8"
            aria-label="Global"
          >
            <div className="flex lg:flex-1">
              <a
                href="#"
                className="-m-1.5 p-1.5 text-2xl font-bold text-gradient-primary"
              >
                CoastalGuard AI
              </a>
            </div>
            <div className="flex lg:flex-1 justify-end gap-4">
              {currentUser ? (
                <>
                  <Link to="/alerts">
                    <Button variant="outline">My Alerts</Button>
                  </Link>
                  <Button 
                    variant="outline"
                    onClick={onSignOut}
                  >
                    Sign Out ({currentUser.name})
                  </Button>
                </>
              ) : (
                <Link to="/signin">
                  <Button>Get Alerts 🔔</Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="outline">Dashboard &rarr;</Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="relative isolate px-6 pt-14 lg:px-8 ">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[var(--mangrove)] to-[var(--sea)] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>

          <motion.div
            className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <div className="text-center relative">
              {/* Badge */}
              <motion.div 
                className="inline-flex items-center rounded-full bg-[var(--sea)]/10 px-6 py-2 text-sm font-medium text-[var(--sea)] ring-1 ring-[var(--sea)]/20 mb-8"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                🌊 AI-Powered Coastal Protection
              </motion.div>
              
              <motion.h1 
                className="text-5xl font-extrabold tracking-tight text-[var(--fg)] sm:text-7xl lg:text-8xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <span className="block text-gradient-primary">Early Warnings</span>
                <span className="block">for Safer Shores</span>
              </motion.h1>
              
              <motion.p 
                className="mt-8 text-xl leading-8 text-[var(--muted)] max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                An AI-powered early warning platform delivering actionable
                alerts to protect coastal communities, economies, and vital blue
                carbon ecosystems through real-time monitoring and predictive analytics.
              </motion.p>
              
              <motion.div 
                className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <button className="btn-primary w-full px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    🚀 Explore Live Dashboard
                  </button>
                </Link>
              </motion.div>
              
              {/* Floating elements */}
              <motion.div 
                className="absolute -top-4 left-1/4 w-8 h-8 bg-[var(--sea)]/20 rounded-full blur-sm"
                animate={{ y: [0, -10, 0], rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div 
                className="absolute top-20 right-1/4 w-6 h-6 bg-[var(--mangrove)]/30 rounded-full blur-sm"
                animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </main>

        {/* Impact Section */}
        <section className="relative py-32 sm:py-40 bg-radial-hero">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-20">
              <motion.div 
                className="inline-flex items-center rounded-full bg-[var(--mangrove)]/10 px-4 py-2 text-sm font-medium text-[var(--mangrove)] ring-1 ring-[var(--mangrove)]/20 mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                🎯 Impact & Purpose
              </motion.div>
              <motion.h2 
                className="text-4xl font-bold tracking-tight text-[var(--fg)] sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="text-gradient-primary">Why Our Work</span>
                <span className="block">Matters</span>
              </motion.h2>
              <motion.p 
                className="mt-6 text-xl text-[var(--muted)] max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Protecting coastal communities and ecosystems through cutting-edge AI and predictive analytics
              </motion.p>
            </div>
            <motion.div
              className="mx-auto grid max-w-2xl grid-cols-1 gap-8 md:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <Card
                title="Protect Lives & Livelihoods"
                description="Receive timely alerts for storm surges and cyclones, giving communities and response teams critical time to prepare and evacuate."
              />
              <Card
                title="Preserve Blue Carbon"
                description="Monitor the health of mangroves and seagrass beds, detecting threats like pollution and illegal activities to protect these vital carbon sinks."
              />
              <Card
                title="Reduce Economic Loss"
                description="Safeguard coastal infrastructure, fisheries, and tourism by proactively identifying risks like erosion and algal blooms before they become disasters."
              />
              <Card
                title="Build Coastal Resilience"
                description="Empower local governments and NGOs with data-driven insights to develop long-term strategies for sustainable coastal management."
              />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-32 sm:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-20">
              <motion.div 
                className="inline-flex items-center rounded-full bg-[var(--sea)]/10 px-4 py-2 text-sm font-medium text-[var(--sea)] ring-1 ring-[var(--sea)]/20 mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                ⚙️ Platform Features
              </motion.div>
              <motion.h2 
                className="text-4xl font-bold tracking-tight text-[var(--fg)] sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="text-gradient-primary">How The Platform</span>
                <span className="block">Works</span>
              </motion.h2>
              <motion.p 
                className="mt-6 text-xl text-[var(--muted)] max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Advanced AI and machine learning technologies working together to provide comprehensive coastal monitoring
              </motion.p>
            </div>
            <motion.div
              className="mx-auto grid max-w-2xl grid-cols-1 gap-8 md:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <Card
                title="Real-Time Anomaly Detection"
                description="Our AI analyzes live data from sensors and satellites to instantly detect anomalies like illegal dumping and pollution events."
              />
              <Card
                title="Predictive Flood Risk Maps"
                description="Access dynamic, high-resolution maps that model potential flood inundation zones based on weather forecasts and tidal data."
              />
              <Card
                title="Mangrove Health Tracking"
                description="Monitor changes in coastal vegetation and water quality over time, providing key insights for conservation and restoration."
              />
              <Card
                title="Automated Alert System"
                description="Actionable alerts are sent via SMS, app notifications, and dashboards to ensure the right information reaches the right people, instantly."
              />
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-transparent py-32 sm:py-40">
          <motion.div 
            className="relative isolate overflow-hidden glassmorphism px-8 py-20 text-center shadow-2xl sm:rounded-3xl sm:px-20 mx-auto max-w-6xl border border-[var(--border)] hover:border-[var(--sea)]/50 transition-all duration-500"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--sea)]/5 to-[var(--mangrove)]/5 rounded-3xl" />
            <div className="absolute top-6 left-6 w-20 h-20 bg-[var(--sea)]/10 rounded-full blur-xl" />
            <div className="absolute bottom-6 right-6 w-16 h-16 bg-[var(--mangrove)]/10 rounded-full blur-xl" />
            
            <div className="relative z-10">
              <motion.div 
                className="inline-flex items-center rounded-full bg-gradient-to-r from-[var(--sea)]/20 to-[var(--mangrove)]/20 px-6 py-2 text-sm font-medium text-[var(--sea)] ring-2 ring-[var(--sea)]/30 mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                🚀 Ready to Get Started?
              </motion.div>
              
              <motion.h2 
                className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="text-gradient-primary">Ready to Build a</span>
                <span className="block text-[var(--fg)]">More Resilient Coast?</span>
              </motion.h2>

              <motion.p 
                className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-[var(--muted)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Explore the dashboard to see live data in action or get in touch
                to learn how our platform can protect your community and preserve coastal ecosystems.
              </motion.p>
              
              <motion.div 
                className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <button className="btn-primary w-full px-10 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105">
                    🌊 Explore Live Dashboard
                  </button>
                </Link>
              </motion.div>
            </div>
            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
              aria-hidden="true"
            >
              <circle
                cx="512"
                cy="512"
                r="512"
                fill="url(#gradient-circle)"
                fillOpacity="0.7"
              ></circle>
              <defs>
                <radialGradient id="gradient-circle">
                  <stop stopColor="var(--mangrove)"></stop>
                  <stop offset="1" stopColor="var(--sea)"></stop>
                </radialGradient>
              </defs>
            </svg>
          </motion.div>
        </section>
        <Footer></Footer>
      </div>
    </>
  );
};

export default Landing;
