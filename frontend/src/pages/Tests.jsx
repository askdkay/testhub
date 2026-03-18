import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API from '../services/api';
import TestCard from '../components/TestCard';
import { FiFilter, FiLayers, FiSearch, FiBookOpen } from 'react-icons/fi';

function Tests() {
    const [tests, setTests] = useState([]);
    const [categories, setCategories] = useState([]); // Dynamic category state
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, free, paid
    const [category, setCategory] = useState('all'); // stores category id or 'all'

    useEffect(() => {
        const initData = async () => {
            setLoading(true);
            await Promise.all([fetchTests(), fetchCategories()]);
            setLoading(false);
        };
        initData();
    }, []);

    const fetchTests = async () => {
        try {
            const res = await API.get('/tests');
            setTests(res.data);
        } catch (error) {
            console.error('Error loading tests:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await API.get('/exams/categories');
            setCategories(res.data); // Keep as full objects {id, name, ...}
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    // Filter tests
    const filteredTests = tests.filter(test => {
        if (filter === 'free' && !test.is_free) return false;
        if (filter === 'paid' && test.is_free) return false;
        // Compare with test.category_id based on DB structure
        if (category !== 'all' && String(test.category_id) !== String(category)) return false; 
        return true;
    });

    return (
        <div className="min-h-screen bg-[#030712] text-slate-300 font-sans selection:bg-orange-500/30 overflow-hidden pb-24">
            
            {/* Immersive Header Section */}
            <section className="relative pt-32 pb-12 px-6 md:px-12">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-r from-orange-500/10 to-pink-500/10 blur-[120px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
                                <FiBookOpen className="text-xl" />
                            </div>
                            <span className="text-orange-400 font-semibold tracking-widest uppercase text-sm">Library</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                            Available <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">Test Series</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                            Practice with our expertly crafted mock tests and take your exam preparation to the next level.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Main Content Area */}
            <section className="relative z-10 px-6 md:px-12">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Filters Bar (Glassmorphism) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-6 mb-10 backdrop-blur-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg"
                    >
                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                            
                            {/* Filter by Type */}
                            <div className="relative group flex-1 md:flex-none min-w-[180px]">
                                <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors pointer-events-none" />
                                <select 
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl pl-11 pr-10 py-3.5 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="all">All Tests</option>
                                    <option value="free">Free Tests Only</option>
                                    <option value="paid">Premium Tests</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>

                            {/* Dynamic Filter by Category */}
                            <div className="relative group flex-1 md:flex-none min-w-[200px]">
                                <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-400 transition-colors pointer-events-none" />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-[#0a0f1a] border border-white/10 rounded-xl pl-11 pr-10 py-3.5 text-slate-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                            
                        </div>
                        
                        {/* Results Count */}
                        <div className="text-sm font-medium text-slate-400 shrink-0 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                            Showing <span className="text-white">{filteredTests.length}</span> results
                        </div>
                    </motion.div>

                    {/* Tests Grid Area */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="w-14 h-14 border-4 border-white/10 border-t-orange-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
                            <p className="text-slate-400 font-medium tracking-wide animate-pulse">Loading Test Library...</p>
                        </div>
                    ) : filteredTests.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24 bg-white/[0.01] border border-dashed border-white/10 rounded-3xl"
                        >
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                                <FiSearch className="text-3xl" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">No tests found</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                We couldn't find any tests matching your current filters. Try selecting a different category or clearing the filters.
                            </p>
                            <button 
                                onClick={() => { setFilter('all'); setCategory('all'); }}
                                className="mt-6 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all"
                            >
                                Clear Filters
                            </button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredTests.map((test, index) => (
                                <motion.div
                                    key={test.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="h-full"
                                >
                                    <TestCard test={test} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default Tests;