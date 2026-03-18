import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  FiClock, FiCheckCircle,
  FiXCircle, FiMail,
  FiCalendar, FiShield,
  FiArrowRight
} from 'react-icons/fi';

// Background Image
const BG_IMAGE = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";

function RefundPolicy() {
  const lastUpdated = "March 15, 2024";

  const refundRules = [
    {
      title: "30-Day Guarantee",
      desc: "If you're not satisfied within 30 days of purchase, we'll refund your money in full, no questions asked.",
      icon: <FiCheckCircle className="text-3xl" />,
      color: "text-emerald-400",
      bgGlow: "group-hover:bg-emerald-500/10",
      borderGlow: "group-hover:border-emerald-500/30"
    },
    {
      title: "After 30 Days",
      desc: "After 30 days, we cannot offer refunds as you've had access to all our content and features.",
      icon: <FiXCircle className="text-3xl" />,
      color: "text-rose-400",
      bgGlow: "group-hover:bg-rose-500/10",
      borderGlow: "group-hover:border-rose-500/30"
    },
    {
      title: "Cancellations",
      desc: "You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
      icon: <FiCalendar className="text-3xl" />,
      color: "text-blue-400",
      bgGlow: "group-hover:bg-blue-500/10",
      borderGlow: "group-hover:border-blue-500/30"
    }
  ];

  const scenarios = [
    {
      situation: "Wrong test purchased",
      refund: "Eligible for refund within 7 days",
      timeline: "3-5 business days"
    },
    {
      situation: "Duplicate payment",
      refund: "Full refund guaranteed",
      timeline: "5-7 business days"
    },
    {
      situation: "Technical issues",
      refund: "Refund or credit offered",
      timeline: "3-5 business days"
    },
    {
      situation: "Changed mind",
      refund: "Eligible within 30 days",
      timeline: "5-7 business days"
    },
    {
      situation: "Account sharing detected",
      refund: "No refund applicable",
      timeline: "N/A"
    }
  ];

  const steps = [
    { number: 1, title: "Contact Support", desc: "Email us at support@testseries.com with your order details" },
    { number: 2, title: "Provide Information", desc: "Share your order ID, email, and reason for refund" },
    { number: 3, title: "Verification", desc: "Our team verifies your request within 24 hours" },
    { number: 4, title: "Processing", desc: "Approved refunds are processed within 5-7 business days" }
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
            alt="Refund Background"
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
              Peace of Mind
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Refund <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Policy</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              We want you to be completely satisfied with your purchase. Our transparent refund process ensures you're always protected.
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

      {/* Main Content */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          
          {/* 30-Day Guarantee Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-3xl p-10 mb-16 text-center backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <FiShield className="text-4xl text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">30-Day Money-Back Guarantee</h2>
              <p className="text-emerald-400/90 text-lg max-w-2xl mx-auto font-medium">
                Try our test series completely risk-free. If you're not fully satisfied with the content, get a full refund within 30 days of your purchase.
              </p>
            </div>
          </motion.div>

          {/* Refund Rules Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {refundRules.map((rule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/[0.02] border border-white/5 rounded-3xl p-8 transition-all duration-300 group backdrop-blur-md text-center flex flex-col items-center ${rule.bgGlow} ${rule.borderGlow}`}
              >
                <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${rule.color}`}>
                  {rule.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{rule.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{rule.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Refund Scenarios Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">Common Refund Scenarios</h2>
            <div className="bg-[#0a0f1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-slate-300">
                      <th className="py-5 px-6 font-semibold whitespace-nowrap">Situation</th>
                      <th className="py-5 px-6 font-semibold whitespace-nowrap">Refund Eligibility</th>
                      <th className="py-5 px-6 font-semibold whitespace-nowrap">Processing Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {scenarios.map((item, index) => (
                      <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 px-6 text-slate-200 font-medium">{item.situation}</td>
                        <td className="py-5 px-6 text-orange-400 font-medium">{item.refund}</td>
                        <td className="py-5 px-6 text-slate-400">{item.timeline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Refund Process Timeline */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold text-white mb-12 text-center">How to Request a Refund</h2>
            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Connecting Line (Desktop only) */}
              <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-white/10 z-0"></div>
              
              {steps.map((step) => (
                <div key={step.number} className="relative z-10 text-center flex flex-col items-center group">
                  <div className="w-16 h-16 bg-[#0a0f1a] border-2 border-white/10 rounded-full flex items-center justify-center text-xl font-bold text-slate-400 mb-6 group-hover:border-orange-500 group-hover:text-orange-400 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.2)] transition-all duration-300 bg-clip-padding backdrop-filter backdrop-blur-xl">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed px-2">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Support CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 bg-gradient-to-r from-orange-500/20 via-pink-500/10 to-transparent border border-orange-500/20 rounded-[2.5rem] relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div>
                <h3 className="text-3xl font-bold text-white mb-3">Ready to Start the Process?</h3>
                <p className="text-slate-400 text-lg max-w-lg">
                  Contact our support team with your details, and we'll help you process your refund request swiftly.
                </p>
              </div>
              
              <div className="flex shrink-0">
                <a
                  href="mailto:support@testseries.com"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all group"
                >
                  <FiMail className="text-lg" />
                  Email Support
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

export default RefundPolicy;