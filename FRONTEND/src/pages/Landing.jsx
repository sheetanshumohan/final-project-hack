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

const Landing = () => {
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
            <div className="flex lg:flex-1 justify-end">
              <Link to="/dashboard">
                <Button>View Dashboard &rarr;</Button>
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
            className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-[var(--fg)] sm:text-6xl shine-effect">
                Early Warnings for Safer Shores
              </h1>
              <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
                An AI-powered early warning platform delivering actionable
                alerts to protect coastal communities, economies, and vital blue
                carbon ecosystems.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/dashboard">
                  <Button>View Dashboard &rarr;</Button>
                </Link>
                <Button variant="secondary">Learn Our Mission</Button>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Impact Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl mb-16">
              Why Our Work Matters
            </h2>
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
        <section className="py-24 sm:py-32 ">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl mb-16">
              How The Platform Works
            </h2>
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
        <section className="bg-transparent py-24 sm:py-32">
          <div className="relative isolate overflow-hidden glassmorphism px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16 mx-auto max-w-7xl">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-gradient-primary sm:text-4xl">
              Ready to Build a More Resilient Coast?
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
              Explore the dashboard to see live data in action or get in touch
              to learn how our platform can protect your community.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/dashboard">
                <Button>Explore the Live Dashboard &rarr;</Button>
              </Link>
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
          </div>
        </section>
        <Footer></Footer>
      </div>
    </>
  );
};

export default Landing;
