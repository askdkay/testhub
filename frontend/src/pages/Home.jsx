import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useInView as useInViewHook } from 'react-intersection-observer';
// import Navbar from '../components/Navbar';
import {
  FiBookOpen, FiClock, FiAward, FiTrendingUp, FiUsers,
  FiStar, FiDownload, FiCheckCircle, FiChevronRight,
  FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter,
  FiInstagram, FiYoutube, FiArrowRight, FiPlay, FiBell
} from 'react-icons/fi';
import {
  FaRupeeSign, FaWhatsapp, FaTelegram,
  FaGraduationCap, FaChartLine, FaShieldAlt
} from 'react-icons/fa';

function Home() {
  const [scrollY, setScrollY] = useState(0);
  const { scrollYProgress } = useScroll();

  // Is range ko [0, 0.2] se badha kar [0, 0.4] kar dein
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll reveal component - Ab content pehle se visible rahega
  const RevealSection = ({ children, delay = 0 }) => {
    const [ref, inView] = useInViewHook({
      triggerOnce: true,
      threshold: 0.1,
      initialInView: true // YEH LINE IMPORTANT HAI
    });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 1, y: 0 }} // Pehle se visible
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }} // Hamesha visible
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8, delay }}
      >
        {children}
      </motion.div>
    );
  };
  return (
    <div className="min-h-screen bg-deep-black text-white font-['Inter'] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid-pattern bg-[length:40px_40px] pointer-events-none opacity-20"></div>
      <div className="fixed inset-0 bg-radial-glow pointer-events-none"></div>

      {/* <Navbar /> */}

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative min-h-screen flex items-center justify-center pt-28"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-8"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-400 text-sm font-medium">Trusted by 5L+ Aspirants</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              World's Most
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
              Powerful Tests
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto"
          >
            India's most advanced test series platform for UPSC, SSC, Banking,
            Railway & State exams. Real exam simulation with AI-powered analytics.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button className="group relative bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold overflow-hidden hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300">
              <span className="relative z-10 flex items-center">
                Start Free Trial
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>

            <button className="flex items-center px-8 py-4 rounded-full text-lg font-semibold border border-glass-border hover:bg-glass-bg transition-all duration-300 group">
              <FiPlay className="mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {[
              { number: '5L+', label: 'Active Students' },
              { number: '1000+', label: 'Mock Tests' },
              { number: '98%', label: 'Success Rate' },
              { number: '24/7', label: 'Expert Support' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400 mt-2">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/4 left-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
      </motion.section>

      {/* 2. Exam Categories Grid */}
      <RevealSection>
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Popular <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Exam Categories</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Choose from 50+ exam categories designed by India's top educators
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name: 'SSC CGL', icon: '📊', students: '2.5L+', color: 'from-blue-500 to-cyan-500' },
                { name: 'UPSC', icon: '🏛️', students: '1.8L+', color: 'from-orange-500 to-red-500' },
                { name: 'Banking', icon: '🏦', students: '3.2L+', color: 'from-green-500 to-emerald-500' },
                { name: 'Railway', icon: '🚂', students: '2.1L+', color: 'from-purple-500 to-pink-500' },
                { name: 'Defence', icon: '⚔️', students: '1.2L+', color: 'from-yellow-500 to-orange-500' },
                { name: 'State PSC', icon: '📜', students: '1.5L+', color: 'from-indigo-500 to-purple-500' },
                { name: 'Teaching', icon: '👨‍🏫', students: '95K+', color: 'from-pink-500 to-rose-500' },
                { name: 'Police', icon: '👮', students: '85K+', color: 'from-blue-600 to-indigo-600' },
                { name: 'NDA', icon: '🎖️', students: '65K+', color: 'from-green-600 to-teal-600' },
                { name: 'CDS', icon: '⚡', students: '45K+', color: 'from-red-500 to-pink-500' }
              ].map((exam, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-6 cursor-pointer overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${exam.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                  <div className="text-4xl mb-3">{exam.icon}</div>
                  <h3 className="font-bold text-lg mb-1">{exam.name}</h3>
                  <p className="text-sm text-gray-400">{exam.students} students</p>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* 3. Key Features with Icons */}
      <RevealSection>
        <section className="py-24 px-4 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Choose Us?</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Everything you need to crack your dream exam
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: FiBookOpen, title: '1000+ Mock Tests', desc: 'Topic-wise, sectional & full-length tests with actual exam pattern' },
                { icon: FiClock, title: 'Real Exam Simulation', desc: 'Exact UI, timer & difficulty level as real exams' },
                { icon: FiAward, title: 'AI-Powered Analysis', desc: 'Get personalized insights & improvement tips' },
                { icon: FiTrendingUp, title: 'All India Rank', desc: 'Compare your performance with lakhs of students' },
                { icon: FiUsers, title: 'Expert Guidance', desc: 'Video solutions & doubt clearing by top faculty' },
                { icon: FaShieldAlt, title: 'Anti-Cheating Tech', desc: 'Secure environment with tab-switch detection' }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-8 group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="text-2xl text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* 4. Success Statistics */}
      <RevealSection>
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">5 Lakh+</span>
                  <br />Aspirants Trust Us
                </h2>
                <p className="text-xl text-gray-400 mb-8">
                  Join India's fastest growing test series platform
                </p>

                <div className="space-y-6">
                  {[
                    { number: '98%', label: 'Success Rate in 2024', progress: 98 },
                    { number: '15,000+', label: 'Government Selections', progress: 85 },
                    { number: '4.8/5', label: 'App Store Rating', progress: 96 }
                  ].map((stat, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-2xl">{stat.number}</span>
                        <span className="text-gray-400">{stat.label}</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${stat.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                          className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((item) => (
                    <motion.div
                      key={item}
                      whileHover={{ scale: 1.05 }}
                      className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-6 text-center"
                    >
                      <div className="text-3xl font-bold text-green-400 mb-2">🏆</div>
                      <div className="text-2xl font-bold">AIR {item}</div>
                      <div className="text-sm text-gray-400">Rank Holder</div>
                    </motion.div>
                  ))}
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-10 -right-10 w-32 h-32 border border-green-500/20 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-10 -left-10 w-40 h-40 border border-blue-500/20 rounded-full"
                />
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* 5. Student Testimonials */}
      <RevealSection>
        <section className="py-24 px-4 bg-gradient-to-b from-transparent via-green-500/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                What Our <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Toppers Say</span>
              </h2>
              <p className="text-xl text-gray-400">Join 5 lakh+ successful aspirants</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Priya Sharma',
                  exam: 'UPSC CSE 2024 (AIR 127)',
                  text: 'The mock tests were so close to actual paper. Sectional analysis helped me improve my weak areas.',
                  rating: 5,
                  image: '👩‍🎓'
                },
                {
                  name: 'Rahul Verma',
                  exam: 'SSC CGL 2024 (AIR 45)',
                  text: 'Daily current affairs quizzes and full-length mocks were game-changer. Got exact pattern questions.',
                  rating: 5,
                  image: '👨‍🎓'
                },
                {
                  name: 'Amit Kumar',
                  exam: 'IBPS PO 2024 (AIR 89)',
                  text: 'The AI analysis pinpointed my mistakes. Improved from 60 to 95 percentile in just 2 months.',
                  rating: 5,
                  image: '👨‍💼'
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -10 }}
                  className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-8"
                >
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-4">{testimonial.image}</div>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-green-400">{testimonial.exam}</p>
                    </div>
                  </div>
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FiStar key={i} className="text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.text}"</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* 6. Sample Test Showcase */}
      <RevealSection>
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Try <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Free Sample Tests</span>
              </h2>
              <p className="text-xl text-gray-400">Experience our test interface before you buy</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'SSC CGL 2024', questions: '100 Qs', time: '60 min', free: true },
                { name: 'UPSC Prelims', questions: '200 Qs', time: '120 min', free: true },
                { name: 'IBPS PO Prelims', questions: '150 Qs', time: '90 min', free: true },
                { name: 'RRB NTPC', questions: '120 Qs', time: '75 min', free: true }
              ].map((test, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-3xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">{test.name}</h3>
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-4">
                    <span>{test.questions}</span>
                    <span>⏱️ {test.time}</span>
                  </div>
                  <button className="w-full bg-gradient-to-r from-green-500/20 to-blue-500/20 hover:from-green-500 hover:to-blue-500 text-white py-3 rounded-xl transition-all duration-300 border border-green-500/30 hover:border-transparent">
                    Start Free Test →
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* 7. Pricing Plans */}
      <RevealSection>
        <section className="py-24 px-4 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Simple <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Pricing</span>
              </h2>
              <p className="text-xl text-gray-400">Choose the plan that fits your preparation</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: 'Basic',
                  price: '499',
                  period: 'month',
                  features: ['20 Mock Tests', 'Basic Analysis', 'Topic Tests', 'Email Support'],
                  popular: false,
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  name: 'Pro',
                  price: '999',
                  period: 'month',
                  features: ['100+ Mock Tests', 'AI Analysis', 'Video Solutions', '24/7 Support', 'All India Rank'],
                  popular: true,
                  color: 'from-orange-500 to-red-500'
                },
                {
                  name: 'Premium',
                  price: '1999',
                  period: '3 months',
                  features: ['Unlimited Tests', '1-on-1 Mentorship', 'Study Material', 'Priority Support', 'Doubt Sessions'],
                  popular: false,
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -10 }}
                  className={`relative backdrop-blur-xl bg-glass-bg border ${plan.popular ? 'border-orange-500/50' : 'border-glass-border'
                    } rounded-3xl p-8`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </div>
                  )}

                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold">₹{plan.price}</span>
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <FiCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full bg-gradient-to-r ${plan.color} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300`}>
                    Choose Plan
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* 8. Latest Updates */}
      <RevealSection>
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Latest <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Updates</span>
                </h2>
                <p className="text-xl text-gray-400 mb-8">Stay updated with exam notifications & new features</p>

                <div className="space-y-4">
                  {[
                    { title: 'SSC CGL 2024 Notification Out', date: '2 hours ago', type: 'exam' },
                    { title: 'New Feature: AI Performance Analysis', date: 'Yesterday', type: 'feature' },
                    { title: 'UPSC Prelims 2024 Results Announced', date: '3 days ago', type: 'result' },
                    { title: 'IBPS PO 2024 Application Started', date: '1 week ago', type: 'notification' }
                  ].map((update, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ x: 10 }}
                      className="flex items-center justify-between p-4 backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl"
                    >
                      <div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs mb-2 ${update.type === 'exam' ? 'bg-orange-500/20 text-orange-400' :
                            update.type === 'feature' ? 'bg-green-500/20 text-green-400' :
                              update.type === 'result' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-purple-500/20 text-purple-400'
                          }`}>
                          {update.type.toUpperCase()}
                        </span>
                        <h4 className="font-medium">{update.title}</h4>
                      </div>
                      <span className="text-sm text-gray-400">{update.date}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-64 h-64 mx-auto border-2 border-green-500/30 rounded-full flex items-center justify-center"
                >
                  <div className="w-48 h-48 border-2 border-blue-500/30 rounded-full flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                      <FiBell className="text-4xl text-white" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* 9. Mobile App Promotion */}
      <RevealSection>
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-xl bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 border border-glass-border rounded-3xl p-12 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Practice on the <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Go</span>
                  </h2>
                  <p className="text-xl text-gray-400 mb-8">
                    Download our mobile app and practice anytime, anywhere.
                    Available on both Android & iOS.
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <button className="flex items-center space-x-3 bg-black/50 backdrop-blur-xl border border-glass-border px-6 py-3 rounded-xl hover:bg-black/70 transition-all">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.6 9.6l-4-2.3-3.6 3.6 3.6 3.6 4-2.3c.8-.5.8-1.6 0-2.1zM3 5v14c0 .8.9 1.3 1.6.9l12-7c.8-.5.8-1.6 0-2.1l-12-7c-.7-.4-1.6.1-1.6.9z" />
                      </svg>
                      <div className="text-left">
                        <div className="text-xs">GET IT ON</div>
                        <div className="text-sm font-bold">Google Play</div>
                      </div>
                    </button>

                    <button className="flex items-center space-x-3 bg-black/50 backdrop-blur-xl border border-glass-border px-6 py-3 rounded-xl hover:bg-black/70 transition-all">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.7 12.4c-.1-2.6 1.5-4.8 3.7-6.2-1.4-2-3.5-3.2-5.9-3.2-2.5 0-4.2 1.3-5.3 1.3-1.2 0-3-1.2-5-1.2-3.4 0-6.7 2.6-6.7 7.6 0 2.5.8 5.1 2.3 7.2 1.4 2 3 4.2 5.2 4.2 2 0 3-1.2 5.1-1.2 2.2 0 3.2 1.3 5.2 1.3 2.3 0 4-2.3 5.3-4.4-2.3-1.5-3.7-3.9-3.9-6.4zM15.1 3.9c1.2-1.3 1.8-2.9 1.6-4.5-1.5.1-3.2.8-4.2 2-1.1 1.2-1.8 2.8-1.6 4.4 1.6.1 3.2-.7 4.2-1.9z" />
                      </svg>
                      <div className="text-left">
                        <div className="text-xs">Download on the</div>
                        <div className="text-sm font-bold">App Store</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="relative z-10"
                  >
                    <img
                      src="https://placehold.co/300x600/1a1a1a/3b82f6?text=App+Preview"
                      alt="App Preview"
                      className="w-64 mx-auto rounded-3xl shadow-2xl"
                    />
                  </motion.div>

                  {/* Floating Badges */}
                  <motion.div
                    animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-10 -right-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold"
                  >
                    4.8 ★
                  </motion.div>

                  <motion.div
                    animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute bottom-10 -left-10 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold"
                  >
                    1M+ Downloads
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* 10. Comprehensive Footer */}
      <footer className="border-t border-glass-border pt-16 pb-8 px-4 mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* About */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FiBookOpen className="text-white text-xl" />
                </div>
                <span className="text-xl font-bold">TestSeries</span>
              </div>
              <p className="text-gray-400 mb-4">
                India's most trusted test series platform for competitive exams.
                Empowering 5 lakh+ aspirants since 2020.
              </p>
              <div className="flex space-x-4">
                {[FiFacebook, FiTwitter, FiInstagram, FiYoutube].map((Icon, index) => (
                  <a key={index} href="#" className="w-10 h-10 bg-glass-bg border border-glass-border rounded-full flex items-center justify-center hover:bg-green-500/20 transition-colors">
                    <Icon className="text-gray-400" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {['About Us', 'Contact Us', 'Terms & Conditions', 'Privacy Policy', 'Refund Policy', 'FAQ'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-green-400 transition-colors flex items-center">
                      <FiChevronRight className="mr-2 text-xs" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Exam Categories */}
            <div>
              <h4 className="text-lg font-bold mb-6">Exam Categories</h4>
              <ul className="space-y-3">
                {['SSC CGL/CHSL', 'UPSC Civil Services', 'IBPS PO/Clerk', 'RRB NTPC', 'State PSC', 'Defence Exams'].map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-gray-400">
                  <FiMapPin className="mt-1 flex-shrink-0" />
                  <span>Barmer rajasthan</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-400">
                  <FiPhone />
                  <span>coming soon</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-400">
                  <FiMail />
                  <span>itsdkay2005@gmail.com</span>
                </li>
              </ul>

              {/* Social Apps */}
              <div className="flex space-x-3 mt-6">
                <a href="#" className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm border border-green-500/30">
                  <FaWhatsapp />
                  <span>WhatsApp</span>
                </a>
                <a href="#" className="flex items-center space-x-2 bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm border border-blue-500/30">
                  <FaTelegram />
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-glass-border pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
              <p>© 2026 TestSeries. All rights reserved. Made with DKAY</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <span>🇮🇳 Proudly Indian</span>
                <span>🔒 Secure Payment</span>
                <span>⭐ ISO Certified</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;