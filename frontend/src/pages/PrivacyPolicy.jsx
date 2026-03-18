import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  FiShield, FiLock, FiEye, FiDatabase,
  FiCreditCard, FiMail, FiGlobe, FiUsers,
  FiCheckCircle, FiAlertCircle, FiClock,
  FiArrowRight
} from 'react-icons/fi';
import { FaUserSecret, FaCookieBite } from 'react-icons/fa';

// Background Image
const BG_IMAGE = "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";

function PrivacyPolicy() {
  const lastUpdated = "March 15, 2024";

  const sections = [
    {
      icon: <FiDatabase size={24} />,
      title: "Information We Collect",
      points: [
        "Personal information: name, email address, phone number",
        "Account credentials: username and password",
        "Payment information: processed securely by third-party providers",
        "Usage data: tests taken, scores, time spent",
        "Device information: IP address, browser type, device type"
      ]
    },
    {
      icon: <FiLock size={24} />,
      title: "How We Use Your Information",
      points: [
        "To provide and maintain our test series services",
        "To personalize your learning experience",
        "To process your payments and subscriptions",
        "To communicate updates and exam notifications",
        "To improve our platform and develop new features"
      ]
    },
    {
      icon: <FiEye size={24} />,
      title: "Information Sharing",
      points: [
        "We never sell your personal information",
        "We share data with trusted partners only for service delivery",
        "Payment processors handle transaction data securely",
        "We may share anonymized data for analytics",
        "Legal compliance if required by law"
      ]
    },
    {
      icon: <FaCookieBite size={24} />,
      title: "Cookies & Tracking",
      points: [
        "We use cookies to enhance your browsing experience",
        "Session cookies keep you logged in",
        "Analytics cookies help us improve our platform",
        "You can control cookie preferences in browser settings",
        "Third-party services may use their own cookies"
      ]
    },
    {
      icon: <FiShield size={24} />,
      title: "Data Security",
      points: [
        "256-bit SSL encryption for all data transmission",
        "Regular security audits and penetration testing",
        "Access controls and authentication protocols",
        "Secure data centers with 24/7 monitoring",
        "Immediate notification of any security incidents"
      ]
    },
    {
      icon: <FiUsers size={24} />,
      title: "Your Rights",
      points: [
        "Right to access your personal data",
        "Right to correct inaccurate information",
        "Right to delete your account and data",
        "Right to opt-out of marketing communications",
        "Right to data portability"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-orange-500/30 overflow-hidden">
      <Navbar />

      {/* Immersive Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 border-b border-white/5">
        {/* Background Mask */}
        <div className="absolute inset-0 z-0">
          <img 
            src={BG_IMAGE} 
            alt="Privacy Background"
            className="w-full h-full object-cover opacity-10 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/60 via-[#030712]/90 to-[#030712]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-sm font-semibold tracking-widest uppercase mb-6 inline-block backdrop-blur-md">
              Data Protection
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Policy</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Your privacy is fundamental to us. Learn how we securely protect, manage, and utilize your data.
            </p>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 bg-white/[0.03] border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-md text-sm font-medium text-slate-300"
            >
              <FiClock className="text-orange-400" />
              Last Updated: <span className="text-white">{lastUpdated}</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          
          {/* Commitment Card (Glassmorphism) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-3xl p-8 md:p-10 mb-16 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/30">
                <FaUserSecret className="text-3xl text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Our Commitment</h2>
                <p className="text-slate-400 leading-relaxed text-lg">
                  At TestSeries, we take your privacy seriously. We are committed to protecting your personal information and being completely transparent about how we use it. This policy explains our practices regarding data collection, usage, and your inherent rights.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Privacy Sections Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all group backdrop-blur-md h-full flex flex-col"
              >
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-orange-400 mb-6 group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  {section.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-5">{section.title}</h3>
                <ul className="space-y-3 flex-grow">
                  {section.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <FiCheckCircle className="text-emerald-400 text-lg shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-400 font-medium leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Third Party Services */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 md:p-10 mb-16 backdrop-blur-md"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                <FiGlobe className="text-2xl text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">Third-Party Services</h3>
            </div>
            <p className="text-slate-400 mb-8 text-lg">
              To provide the best experience, we integrate with industry-leading third-party services that may process your information securely:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['Razorpay', 'Google Analytics', 'AWS', 'SendGrid', 'Cloudflare', 'Stripe'].map((service, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl text-center text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-default">
                  {service}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Information CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 bg-gradient-to-r from-orange-500/20 via-pink-500/10 to-transparent border border-orange-500/20 rounded-[2.5rem] relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">Privacy Questions?</h3>
                <p className="text-slate-400 text-lg max-w-lg">
                  If you have any questions about our Privacy Policy or how we handle your data, our Data Protection Officer is ready to assist you.
                </p>
              </div>
              
              <div className="flex shrink-0">
                <a
                  href="/contact"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all group"
                >
                  <FiMail className="text-lg" />
                  Contact DPO
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform ml-1" />
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}

export default PrivacyPolicy;