import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  FiUsers, FiTarget, FiEye, FiHeart, 
  FiTrendingUp, FiBookOpen,
  FiMapPin, FiPhone, FiMail
} from 'react-icons/fi';
import { FaMedal } from 'react-icons/fa';

// Background Images
const BG_IMAGE = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
const TEAM_IMAGE = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
const OFFICE_IMAGE = "";

function AboutUs() {
  const stats = [
    { number: '5 Lakh+', label: 'Happy Students', icon: <FiUsers size={28} /> },
    { number: '10,000+', label: 'Mock Tests', icon: <FiBookOpen size={28} /> },
    { number: '25,000+', label: 'Govt. Selections', icon: <FaMedal size={28} /> },
    { number: '98%', label: 'Success Rate', icon: <FiTrendingUp size={28} /> },
  ];

  const values = [
    {
      icon: <FiTarget size={32} />,
      title: 'Our Mission',
      desc: 'To make quality education accessible to every aspirant across India and help them achieve their dream government job.'
    },
    {
      icon: <FiEye size={32} />,
      title: 'Our Vision',
      desc: 'To become India\'s most trusted test series platform, empowering 1 crore students by 2025.'
    },
    {
      icon: <FiHeart size={32} />,
      title: 'Our Values',
      desc: 'Integrity, Innovation, Student-First Approach, and Excellence in everything we do.'
    }
  ];

  const team = [
    {
      name: 'Dinesh',
      role: 'Founder & CEO',
      experience: '15+ yrs Education',
      image: '👨‍💼',
      bio: 'Msc in zoology'
    }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-orange-500/30 overflow-hidden">
      <Navbar />

      {/* Immersive Hero Section */}
      <section className="relative pt-32 pb-24 px-6 md:px-12">
        {/* Background Mask */}
        <div className="absolute inset-0 z-0">
          <img 
            src={BG_IMAGE} 
            alt="About Us Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/40 via-[#030712]/80 to-[#030712]"></div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/20 blur-[150px] rounded-full"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center pt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-orange-400 text-sm font-semibold tracking-widest uppercase mb-6 inline-block backdrop-blur-md">
              Discover Our Journey
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Empowering Dreams,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                Transforming Lives.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              India's most trusted test series platform, bridging the gap between ambition and achievement since 2020.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Floating Stats Section */}
      <section className="relative z-20 px-6 -mt-12 mb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 text-center hover:bg-white/[0.05] hover:border-orange-500/30 transition-all duration-300 group"
              >
                <div className="w-14 h-14 mx-auto bg-orange-500/10 text-orange-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Story</span>
              </h2>
              <div className="space-y-6 text-slate-400 text-lg leading-relaxed">
                <p>
                  TestSeries started in 2020 with a simple idea — to make quality test preparation accessible to every aspirant, regardless of their location or financial background.
                </p>
                <p>
                  What began as a small project by a group of passionate educators and technologists has now grown into India's most trusted test series platform, serving over <strong className="text-white">5 lakh students across 500+ cities</strong>.
                </p>
                <p>
                  Today, we're proud to have helped 25,000+ students achieve their dream of government jobs, with many ranking in the top 100 of exams like UPSC, SSC, and Banking.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* Decorative Elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 to-pink-500/20 blur-2xl rounded-[3rem]"></div>
              <img 
                src={TEAM_IMAGE} 
                alt="Our Team"
                className="relative rounded-[2rem] shadow-2xl border border-white/10 w-full object-cover h-[500px]"
              />
              <div className="absolute -bottom-8 -left-8 bg-white/[0.05] backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl">
                <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 mb-1">5+</p>
                <p className="text-sm font-medium text-slate-300 uppercase tracking-widest">Years of Excellence</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-24 px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-pink-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="bg-white/[0.02] border border-white/5 rounded-3xl p-10 hover:bg-white/[0.04] transition-colors relative overflow-hidden group"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>
                
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center mb-8">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{value.title}</h3>
                <p className="text-slate-400 leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Leadership</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Passionate educators and technologists working together to redefine test preparation for millions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:border-white/10 hover:bg-white/[0.04] transition-all group text-center"
              >
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-white/10 rounded-full flex items-center justify-center text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-black/50">
                  {member.image}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-orange-400 text-sm font-semibold tracking-wide uppercase mb-3">{member.role}</p>
                <div className="inline-block px-3 py-1 bg-white/5 rounded-md text-xs text-slate-400 font-medium mb-4 border border-white/5">
                  {member.experience}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Office Location */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 md:p-16 overflow-hidden relative">
          {/* subtle background styling */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none"></div>

          <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Headquarters</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                Located in the heart of Noida's tech hub, our office is where innovation meets education. We're always excited to welcome students, educators, and partners.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <FiMapPin className="text-orange-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Visit Us</h4>
                    <p className="text-slate-400 leading-relaxed">
                     Ram nagar <br />Barmer Rajasthan
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <FiPhone className="text-orange-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Call Us</h4>
                    <p className="text-slate-400">+91 ----------</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <FiMail className="text-orange-400 text-xl" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Email Us</h4>
                    <p className="text-slate-400">testhub.gmail.com</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <img 
                  src={OFFICE_IMAGE} 
                  alt="Our Office"
                  className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-[10s]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/80 via-transparent to-transparent"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;