import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  FiSearch, FiChevronDown, FiHelpCircle,
  FiBookOpen, FiCreditCard, FiUser,
  FiMessageCircle, FiMail
} from 'react-icons/fi';
import { FaQuestionCircle, FaRegLifeRing } from 'react-icons/fa';

// Background Image
const BG_IMAGE = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";

function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState({});

  const categories = [
    { id: 'all', name: 'All Questions', icon: <FaQuestionCircle />, count: 15 },
    { id: 'account', name: 'Account', icon: <FiUser />, count: 4 },
    { id: 'tests', name: 'Tests & Preparation', icon: <FiBookOpen />, count: 4 },
    { id: 'payment', name: 'Payments', icon: <FiCreditCard />, count: 3 },
    { id: 'technical', name: 'Technical Issues', icon: <FiHelpCircle />, count: 2 },
    { id: 'other', name: 'Other', icon: <FiMessageCircle />, count: 2 }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: "How do I create an account?",
      answer: "Click on the 'Sign Up' button on the top right corner. Fill in your details including name, email, and password. Verify your email address and you're ready to start!"
    },
    {
      id: 2,
      category: 'account',
      question: "I forgot my password. What should I do?",
      answer: "Click on 'Forgot Password' on the login page. Enter your registered email address, and we'll send you a password reset link. Follow the instructions to set a new password."
    },
    {
      id: 3,
      category: 'account',
      question: "Can I change my email address?",
      answer: "Yes, you can update your email address in Account Settings. Go to Profile → Settings → Account Information and edit your email. You'll need to verify the new email address."
    },
    {
      id: 4,
      category: 'account',
      question: "How do I delete my account?",
      answer: "To delete your account, please contact our support team at support@testseries.com. Note that this action is permanent and all your data will be removed."
    },
    {
      id: 5,
      category: 'tests',
      question: "How many tests are available?",
      answer: "We offer over 10,000+ mock tests across all major competitive exams including SSC, UPSC, Banking, Railway, and State PSC exams. New tests are added regularly."
    },
    {
      id: 6,
      category: 'tests',
      question: "Are the tests available in Hindi?",
      answer: "Yes, most of our tests are available bilingually in English and Hindi. You can switch languages during the test or in your account settings."
    },
    {
      id: 7,
      category: 'tests',
      question: "Can I take tests on mobile?",
      answer: "Absolutely! Our platform is fully responsive and works on all devices. You can also download our mobile app from Google Play Store and Apple App Store."
    },
    {
      id: 8,
      category: 'tests',
      question: "How is the rank calculated?",
      answer: "Your All India Rank is calculated based on your performance compared to all other students who have taken the same test. Higher scores and faster completion times get better ranks."
    },
    {
      id: 9,
      category: 'payment',
      question: "What payment methods do you accept?",
      answer: "We accept all major payment methods including credit/debit cards, UPI (Google Pay, PhonePe, Paytm), net banking, and popular wallets."
    },
    {
      id: 10,
      category: 'payment',
      question: "Can I get a refund?",
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our test series, contact us within 30 days of purchase for a full refund."
    },
    {
      id: 11,
      category: 'payment',
      question: "How do I cancel my subscription?",
      answer: "Go to Account Settings → Subscription and click 'Cancel Subscription'. You'll continue to have access until the end of your billing period."
    },
    {
      id: 12,
      category: 'technical',
      question: "The test page is not loading properly",
      answer: "Try clearing your browser cache and cookies. If the problem persists, try a different browser or device. Contact support if you still face issues."
    },
    {
      id: 13,
      category: 'technical',
      question: "My timer stopped during the test",
      answer: "Don't worry! Your answers are automatically saved. Refresh the page and you'll be able to continue from where you left off. The timer will show the correct remaining time."
    },
    {
      id: 14,
      category: 'other',
      question: "Do you offer study material?",
      answer: "Yes, we provide comprehensive study notes, current affairs updates, and video solutions for all major topics. These are included with our test series packages."
    },
    {
      id: 15,
      category: 'other',
      question: "How can I contact support?",
      answer: "You can reach us via email at support@testseries.com, call us at +91 98765 43210, or use the live chat feature on our website. We're available 24/7."
    }
  ];

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-orange-500/30 overflow-hidden">
      <Navbar />

      {/* Immersive Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <img 
            src={BG_IMAGE} 
            alt="FAQ Background"
            className="w-full h-full object-cover opacity-10 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/60 via-[#030712]/90 to-[#030712]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-sm font-semibold tracking-widest uppercase mb-6 inline-block backdrop-blur-md">
              Help Center
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Questions</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              Find quick answers to common questions about our platform, features, and subscriptions.
            </p>

            {/* Premium Search Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="max-w-2xl mx-auto relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
              <div className="relative flex items-center bg-[#0a0f1a] border border-white/10 rounded-full overflow-hidden shadow-2xl">
                <FiSearch className="absolute left-6 text-slate-400 text-xl group-focus-within:text-orange-400 transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="What do you need help with?"
                  className="w-full bg-transparent pl-14 pr-6 py-5 text-slate-200 placeholder-slate-500 focus:outline-none text-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content Area */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10">
            
            {/* Categories Sidebar */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 sticky top-28 backdrop-blur-xl">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6 px-2">Categories</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium ${
                        activeCategory === cat.id
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                          : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`text-lg ${activeCategory === cat.id ? 'text-white' : 'text-slate-500'}`}>
                          {cat.icon}
                        </span>
                        {cat.name}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${
                        activeCategory === cat.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-black/20 text-slate-500 border border-white/5'
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Contact Support Mini Card */}
                <div className="mt-8 p-6 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full"></div>
                  <FaRegLifeRing className="text-4xl text-orange-400 mx-auto mb-4 relative z-10" />
                  <h4 className="font-bold text-white mb-2 relative z-10">Still have questions?</h4>
                  <p className="text-sm text-slate-400 mb-5 relative z-10">
                    Can't find what you're looking for? Our team is here to help.
                  </p>
                  <a
                    href="/contact"
                    className="inline-block px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors relative z-10 shadow-lg shadow-orange-500/20"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>

            {/* FAQ Accordion Items */}
            <div className="flex-1">
              <div className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors"
                  >
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 transition-colors duration-300 ${openItems[faq.id] ? 'text-orange-400' : 'text-slate-500 group-hover:text-orange-400'}`}>
                          <FiHelpCircle className="text-xl shrink-0" />
                        </div>
                        <span className={`font-semibold text-lg transition-colors duration-300 ${openItems[faq.id] ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                          {faq.question}
                        </span>
                      </div>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${openItems[faq.id] ? 'bg-orange-500/20 text-orange-400 rotate-180' : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'}`}>
                        <FiChevronDown />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {openItems[faq.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-2 ml-[3.25rem] text-slate-400 leading-relaxed border-t border-white/5">
                            <p>{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Empty State / No Results */}
              {filteredFaqs.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl"
                >
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                    <FiSearch className="text-3xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No questions found</h3>
                  <p className="text-slate-400">
                    Try searching with different keywords or browse another category.
                  </p>
                </motion.div>
              )}
            </div>
            
          </div>
        </div>
      </section>

      {/* Final Contact CTA */}
      <section className="py-24 px-6 relative z-10 border-t border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-pink-500/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">Need More Clarity?</h2>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Our support team is available 24/7 to assist you with any specific queries you might have.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <a
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@testseries.com"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <FiMail className="text-lg text-slate-400" />
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FAQ;