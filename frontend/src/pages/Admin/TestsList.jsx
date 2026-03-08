import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { 
  FiFileText, FiEye, FiEdit2, FiTrash2, FiPlus,
  FiSearch, FiFilter, FiDownload, FiStar, FiTrendingUp
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';

function TestsList() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const res = await API.get('/admin/tests');
      setTests(res.data);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await API.delete(`/admin/tests/${testId}`);
        loadTests();
      } catch (error) {
        console.error('Error deleting test:', error);
      }
    }
  };

  const filteredTests = tests.filter(test => 
    test.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Tests Management
            </h1>
            <p className="text-gray-400 mt-2">Manage all your test series</p>
          </div>
          
          <button
            onClick={() => navigate('/admin/add-test')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl hover:shadow-lg transition-all"
          >
            <FiPlus />
            Add New Test
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-glass-bg border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-green-500/50"
            />
          </div>
          <button className="p-3 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all">
            <FiFilter size={20} className="text-gray-400" />
          </button>
          <button className="p-3 bg-glass-bg border border-glass-border rounded-xl hover:border-green-500/50 transition-all">
            <FiDownload size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-glass-bg border border-glass-border rounded-2xl p-6 hover:border-green-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                    <FiFileText className="text-green-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{test.title}</h3>
                    <p className="text-xs text-gray-400">ID: {test.id}</p>
                  </div>
                </div>
                {test.popular && (
                  <span className="text-yellow-400">
                    <FiStar className="fill-current" />
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Questions:</span>
                  <span>{test.total_questions || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Duration:</span>
                  <span>{test.duration} min</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Price:</span>
                  <span className="flex items-center">
                    {test.is_free ? 'Free' : <><FaRupeeSign size={12} />{test.price}</>}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Attempts:</span>
                  <span>{test.attempts || 0}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-glass-border">
                <button className="p-2 hover:bg-green-500/20 rounded-lg text-green-400 transition-all">
                  <FiEye size={18} />
                </button>
                <button className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all">
                  <FiEdit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(test.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TestsList;