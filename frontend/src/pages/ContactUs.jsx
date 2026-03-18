import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  FiMapPin, FiPhone, FiMail, FiClock,
  FiMessageSquare, FiUser, FiSend,
  FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegram, FaEnvelope } from 'react-icons/fa';

// Background Image
const BG_IMAGE = "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    }, 1500);
  };

  const contactInfo = [
    {
      icon: <FiMapPin className="text-3xl" />,
      title: 'Visit Us',
      details: ['B-123, Ram nagar', 'Barmer, Rajasthan', 'India - 201301'],
      glow: 'shadow-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      icon: <FiPhone className="text-3xl" />,
      title: 'Call Us',
      details: ['+91 ----------', '+91 ------------', 'Mon-Fri, 9am-6pm'],
      glow: 'shadow-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
    {
      icon: <FiMail className="text-3xl" />,
      title: 'Email Us',
      details: ['testhub@gmail.com', ' testseries@gmail.com ', ' testseriesdkay@gmail.com '],
      glow: 'shadow-orange-500/20',
      iconColor: 'text-orange-400'
    }
  ];

  const socialChannels = [
    { icon: <FaWhatsapp className="text-2xl" />, name: 'WhatsApp', link: '#', count: '5+ students' },
    { icon: <FaTelegram className="text-2xl" />, name: 'Telegram', link: '#', count: '10+ members' },
    { icon: <FaEnvelope className="text-2xl" />, name: 'Newsletter', link: '#', count: '50+ subscribers' }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-orange-500/30 overflow-hidden">
      <Navbar />

      {/* Immersive Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:px-12">
        <div className="absolute inset-0 z-0">
          <img 
            src={BG_IMAGE} 
            alt="Contact Background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/40 via-[#030712]/80 to-[#030712]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-sm font-semibold tracking-widest uppercase mb-6 inline-block backdrop-blur-md">
              We're Here For You
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Touch</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Have questions or need assistance? Our team is always ready to help you on your preparation journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="relative z-20 px-6 -mt-12 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-3xl p-8 hover:bg-white/[0.04] transition-all duration-300 group shadow-lg ${info.glow}`}
              >
                <div className={`w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 ${info.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  {info.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{info.title}</h3>
                <div className="space-y-2">
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-slate-400 font-medium">{detail}</p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 md:p-10 backdrop-blur-xl relative overflow-hidden"
            >
              {/* Subtle background glow for form */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[100px] rounded-full pointer-events-none"></div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-3">Send us a Message</h2>
                <p className="text-slate-400 mb-8">Fill out the form below and we'll get back to you within 24 hours.</p>

                {submitted && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-3 font-medium"
                  >
                    <FiCheckCircle className="text-xl shrink-0" />
                    Thank you! Your message has been sent successfully.
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2 pl-1">Your Name <span className="text-orange-500">*</span></label>
                      <div className="relative group">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2 pl-1">Email Address <span className="text-orange-500">*</span></label>
                      <div className="relative group">
                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2 pl-1">Phone Number</label>
                      <div className="relative group">
                        <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2 pl-1">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl px-5 py-3.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                        placeholder="How can we help?"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2 pl-1">Your Message <span className="text-orange-500">*</span></label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="4"
                      className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl px-5 py-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <FiSend className="text-lg" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Map & Social Channels */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col h-full"
            >
              {/* Dark Mode Map Hack via CSS Filters */}
              <div className="bg-[#0a0f1a] border border-white/10 rounded-[2rem] overflow-hidden mb-8 h-72 shadow-2xl relative group">
                <div className="absolute inset-0 bg-black/20 pointer-events-none group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7187.464469032595!2d71.4261726!3d25.746367099999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39443ad9c7a02191%3A0x207570102f1df07a!2sRam%20Nagar%2C%20Barmer%2C%20Rajasthan%20344001!5e0!3m2!1sen!2sin!4v1773610609000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  title="Office Location"
                  className="filter invert-[90%] hue-rotate-180 contrast-125 opacity-80"
                ></iframe>
              </div>

              {/* Social Channels */}
              <h3 className="text-2xl font-bold text-white mb-6">Connect With Us</h3>
              <div className="space-y-4">
                {socialChannels.map((channel, index) => (
                  <a
                    key={index}
                    href={channel.link}
                    className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                        {channel.icon}
                      </div>
                      <div>
                        <p className="font-bold text-slate-200 mb-0.5">{channel.name}</p>
                        <p className="text-sm text-slate-500">{channel.count}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-orange-500/20 group-hover:text-orange-400 transition-colors">
                      <FiSend className="rotate-45" />
                    </div>
                  </a>
                ))}
              </div>

              {/* Business Hours */}
              <div className="mt-8 p-6 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <FiClock className="text-orange-400 text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-3">Business Hours</h4>
                  <div className="space-y-2 text-sm text-slate-400">
                    <p className="flex justify-between w-48"><span className="text-slate-300">Mon - Fri:</span> 9:00 AM - 6:00 PM</p>
                    <p className="flex justify-between w-48"><span className="text-slate-300">Saturday:</span> 10:00 AM - 4:00 PM</p>
                    <p className="flex justify-between w-48"><span className="text-slate-300">Sunday:</span> <span className="text-orange-400 font-medium">Closed</span></p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* FAQ CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0f1a] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-20 h-20 mx-auto bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform duration-300">
            <FiMessageSquare className="text-4xl text-orange-400" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">Got More Questions?</h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Can't find what you're looking for? Head over to our FAQ section to find answers to commonly asked questions about our platform.
          </p>
          <a
            href="/faq"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white/[0.05] border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 hover:border-orange-500/30 hover:text-orange-400 transition-all group"
          >
            Visit FAQ Page
            <FiSend className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>
    </div>
  );
}

export default ContactUs;