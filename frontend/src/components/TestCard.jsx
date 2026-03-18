import { useNavigate } from 'react-router-dom';
import { FiClock, FiFileText, FiLayers, FiArrowRight } from 'react-icons/fi';

function TestCard({ test }) {
    const navigate = useNavigate();

    return (
        <div 
            onClick={() => navigate(`/test/${test.id}`)}
            className="h-full flex flex-col p-6 md:p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 group cursor-pointer relative overflow-hidden"
        >
            {/* Subtle Hover Glow Effect (Updated to Brand Blue/Green) */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>

            {/* Top Section: Badge & Title */}
            <div className="mb-4 relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border ${
                        test.is_free 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
                    }`}>
                        {test.is_free ? 'FREE' : `₹${test.price}`}
                    </span>
                </div>
                {/* Title Hover matches the new brand green */}
                <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {test.title}
                </h3>
            </div>
            
            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-5 relative z-10 border-b border-white/5 pb-5">
                <span className="flex items-center gap-2 font-medium">
                    <FiClock className="text-slate-500 text-lg" /> 
                    {test.duration} mins
                </span>
                <span className="flex items-center gap-2 font-medium">
                    <FiFileText className="text-slate-500 text-lg" /> 
                    {test.total_questions || 0} Qs
                </span>
                <span className="flex items-center gap-2 font-medium">
                    <FiLayers className="text-slate-500 text-lg" /> 
                    <span className="truncate max-w-[100px]" title={test.category || 'General'}>
                        {test.category || 'General'}
                    </span>
                </span>
            </div>
            
            {/* Description */}
            <div className="flex-grow relative z-10 flex flex-col">
                {test.description ? (
                    <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-3">
                        {test.description}
                    </p>
                ) : (
                    <p className="text-slate-500 italic text-sm mb-8">No description available.</p>
                )}
            </div>
            
            {/* Action Button */}
            <div className="mt-auto relative z-10">
                <button 
                    className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                        test.is_free 
                            ? 'bg-white/5 text-slate-200 border border-white/10 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/20' 
                            // New Logo Gradient: Emerald/Green to Blue
                            : 'bg-gradient-to-r from-emerald-400 to-blue-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                    }`}
                >
                    {test.is_free ? 'Start Free Test' : 'Unlock Now'}
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}

export default TestCard;