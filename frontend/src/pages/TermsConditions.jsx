import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  FiFileText, FiCheckCircle, FiAlertCircle,
  FiShield, FiLock, FiUsers, FiCreditCard,
  FiBookOpen, FiClock, FiMail, FiGlobe,
  FiArrowRight
} from 'react-icons/fi';
import { FaGavel, FaRegFileAlt } from 'react-icons/fa';

// Background Image
const BG_IMAGE = "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";

function TermsConditions() {
  const lastUpdated = "March 15, 2024";

  const sections = [
    {
      icon: <FiFileText size={24} />,
      title: "1. Acceptance of Terms",
      content: "By accessing or using TestSeries platform, you agree to be bound by these Terms and Conditions. If you disagree with any part, you may not access our services."
    },
    {
      icon: <FiUsers size={24} />,
      title: "2. User Accounts",
      content: "You must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account credentials and all activities under your account."
    },
    {
      icon: <FiCreditCard size={24} />,
      title: "3. Payments & Subscriptions",
      content: "All payments are processed securely. Subscriptions auto-renew unless cancelled. Refunds are handled as per our Refund Policy. Prices are subject to change with notice."
    },
    {
      icon: <FiBookOpen size={24} />,
      title: "4. Content Usage",
      content: "All test series, questions, and study material are for personal use only. Redistribution, sharing, or commercial use is strictly prohibited."
    },
    {
      icon: <FiShield size={24} />,
      title: "5. User Conduct",
      content: "You agree not to: share accounts, use automated tools, attempt to cheat, harass others, post inappropriate content, or violate any applicable laws."
    },
    {
      icon: <FiLock size={24} />,
      title: "6. Intellectual Property",
      content: "All content on TestSeries is our property or our licensors'. Unauthorized use, reproduction, or distribution is prohibited and may result in legal action."
    },
    {
      icon: <FiAlertCircle size={24} />,
      title: "7. Termination",
      content: "We reserve the right to suspend or terminate accounts for violations of these terms, without prior notice. You may terminate your account at any time."
    },
    {
      icon: <FiGlobe size={24} />,
      title: "8. Governing Law",
      content: "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Noida, Uttar Pradesh."
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
            alt="Terms Background"
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
              Legal Agreement
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Conditions</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Please read these terms carefully before using our platform to understand your rights and responsibilities.
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

      {/* Content Section */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Executive Summary Card (Glassmorphism) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-3xl p-8 md:p-10 mb-16 backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-orange-500/30">
                <FaGavel className="text-3xl text-orange-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-3">Quick Summary</h2>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  These terms create a legally binding agreement between you and TestSeries. By using our platform, you agree to the following core principles:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Use the platform for personal test preparation only",
                    "Keep your account credentials secure",
                    "Not share or redistribute any content",
                    "Comply with all applicable laws"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-white/5 border border-white/5 rounded-xl p-4">
                      <FiCheckCircle className="text-emerald-400 text-lg shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detailed Terms Sections */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Detailed Terms</h3>
            
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all group"
              >
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-orange-400 shrink-0 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 mb-3">{section.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Support CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 p-10 bg-gradient-to-r from-orange-500/20 via-pink-500/10 to-transparent border border-orange-500/20 rounded-[2.5rem] relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">Questions About Terms?</h3>
                <p className="text-slate-400 text-lg max-w-lg">
                  If you have any questions or need clarification regarding these Terms and Conditions, our legal team is here to help.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 shrink-0">
                <a
                  href="/contact"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
                >
                  <FiMail className="text-lg" />
                  Contact Support
                </a>
                <a
                  href="/faq"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all group"
                >
                  <FaRegFileAlt className="text-lg text-slate-400 group-hover:text-white transition-colors" />
                  Visit FAQ
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}

export default TermsConditions;