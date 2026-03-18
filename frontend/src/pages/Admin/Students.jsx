import { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  FiSearch, FiFilter, FiDownload, FiEye, 
  FiEdit2, FiTrash2, FiLock, FiUnlock,
  FiMail, FiPhone, FiCalendar, FiAward,
  FiActivity, FiBarChart2 , FiUsers
} from 'react-icons/fi';

function Students() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await API.get('/admin/users');
      setStudents(res.data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const filteredStudents = students.filter(student => {
    if (searchTerm) {
      return student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             student.email.toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (filter === 'active') return student.status === 'active';
    if (filter === 'blocked') return student.status === 'blocked';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0f172a] ml- p-8 text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Student Management</h1>
          <p className="text-slate-400 mt-1 font-medium">Manage all registered students</p>
        </div>
        <div className="flex space-x-4">
          <button className="flex items-center px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all duration-200 font-medium">
            <FiDownload className="mr-2" />
            Export List
          </button>
          <button className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl hover:from-indigo-400 hover:to-violet-400 transition-all duration-200 font-medium shadow-lg shadow-indigo-500/25">
            Send Bulk Email
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-5 mb-8 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative group">
              <FiSearch className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-48 px-4 py-3 bg-[#0f172a] border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer appearance-none"
          >
            <option value="all">All Students</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
          </select>
          
          <button className="flex items-center px-5 py-3 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl hover:bg-slate-700 hover:text-white transition-all font-medium">
            <FiFilter className="mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 shadow-sm hover:border-blue-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Students</p>
              <h3 className="text-3xl font-bold text-white mt-1">1,234</h3>
            </div>
            <div className="p-3.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <FiUsers className="text-blue-400" size={24} />
            </div>
          </div>
          <p className="text-emerald-400 text-sm mt-3 font-medium flex items-center">
            <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded mr-1.5">↑ 12%</span> this month
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 shadow-sm hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Active Today</p>
              <h3 className="text-3xl font-bold text-white mt-1">456</h3>
            </div>
            <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <FiActivity className="text-emerald-400" size={24} />
            </div>
          </div>
          <p className="text-emerald-400 text-sm mt-3 font-medium flex items-center">
            <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded mr-1.5">↑ 8%</span> from yesterday
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 shadow-sm hover:border-violet-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Premium Users</p>
              <h3 className="text-3xl font-bold text-white mt-1">789</h3>
            </div>
            <div className="p-3.5 bg-violet-500/10 rounded-xl border border-violet-500/20">
              <FiAward className="text-violet-400" size={24} />
            </div>
          </div>
          <p className="text-violet-400 text-sm mt-3 font-medium">64% conversion rate</p>
        </div>

        {/* Card 4 */}
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 shadow-sm hover:border-rose-500/30 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Blocked</p>
              <h3 className="text-3xl font-bold text-white mt-1">23</h3>
            </div>
            <div className="p-3.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
              <FiLock className="text-rose-400" size={24} />
            </div>
          </div>
          <p className="text-rose-400 text-sm mt-3 font-medium flex items-center">
            <span className="bg-rose-500/10 px-1.5 py-0.5 rounded mr-1.5">↓ 3</span> new blocks
          </p>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[#0f172a]/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider text-xs">Student</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider text-xs">Contact</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider text-xs">Exam Prep</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider text-xs">Tests Taken</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider text-xs">Avg Score</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider text-xs">Joined</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-400 uppercase tracking-wider text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${student.name}&background=6366f1&color=fff`}
                        alt={student.name}
                        className="w-10 h-10 rounded-full mr-3 ring-2 ring-slate-800 group-hover:ring-indigo-500/30 transition-all"
                      />
                      <div>
                        <p className="font-semibold text-white">{student.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">ID: STU{student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1.5">
                      <p className="flex items-center text-slate-300">
                        <FiMail className="mr-2 text-slate-500" size={14} />
                        {student.email}
                      </p>
                      <p className="flex items-center text-slate-400 text-xs">
                        <FiPhone className="mr-2 text-slate-500" size={14} />
                        {student.phone || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-semibold tracking-wide">
                      {student.exam_preparation || 'Not Set'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-slate-300 font-medium">
                      <div className="p-1.5 bg-slate-800 rounded-md mr-2 text-slate-400">
                        <FiBarChart2 size={14} />
                      </div>
                      <span>{student.tests_taken || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-20 bg-slate-800 rounded-full h-2 mr-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full" 
                          style={{ width: `${student.avg_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="font-medium text-slate-300">{student.avg_score || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                    <div className="flex items-center">
                      <FiCalendar className="mr-2 text-slate-500" size={14} />
                      {new Date(student.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold tracking-wide rounded-full border ${
                      student.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      student.status === 'blocked' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {student.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowProfile(true);
                        }}
                        className="p-2 hover:bg-blue-500/10 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                        title="View Profile"
                      >
                        <FiEye size={16} />
                      </button>
                      <button className="p-2 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors" title="Edit">
                        <FiEdit2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-amber-500/10 rounded-lg text-slate-400 hover:text-amber-400 transition-colors" title="Block/Unblock">
                        {student.status === 'blocked' ? <FiUnlock size={16} /> : <FiLock size={16} />}
                      </button>
                      <button className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400 transition-colors" title="Delete">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-[#1e293b] border-t border-slate-700/50 flex justify-between items-center">
          <p className="text-sm text-slate-400">Showing <span className="text-white font-medium">1-10</span> of <span className="text-white font-medium">{students.length}</span> students</p>
          <div className="flex space-x-2">
            <button className="px-4 py-1.5 border border-slate-700 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">Previous</button>
            <button className="px-4 py-1.5 bg-indigo-500 text-white rounded-lg shadow-md shadow-indigo-500/20 text-sm font-medium">1</button>
            <button className="px-4 py-1.5 border border-slate-700 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">2</button>
            <button className="px-4 py-1.5 border border-slate-700 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">3</button>
            <button className="px-4 py-1.5 border border-slate-700 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">Next</button>
          </div>
        </div>
      </div>

      {/* Student Profile Modal */}
      {showProfile && selectedStudent && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/50">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">Student Profile</h2>
                <button 
                  onClick={() => setShowProfile(false)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Profile Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Basic Info */}
                <div className="col-span-1 bg-[#0f172a] p-6 rounded-2xl border border-slate-700/50">
                  <div className="text-center mb-8">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${selectedStudent.name}&size=128&background=6366f1&color=fff`}
                      alt={selectedStudent.name}
                      className="w-32 h-32 rounded-full mx-auto mb-4 ring-4 ring-indigo-500/20"
                    />
                    <h3 className="text-xl font-bold text-white">{selectedStudent.name}</h3>
                    <span className="inline-block mt-2 px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 font-medium">ID: STU{selectedStudent.id}</span>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="p-2 bg-slate-800 rounded-lg mr-4 mt-1 text-slate-400">
                        <FiMail size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Email Address</p>
                        <p className="font-medium text-slate-200 break-all">{selectedStudent.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="p-2 bg-slate-800 rounded-lg mr-4 mt-1 text-slate-400">
                        <FiPhone size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Phone Number</p>
                        <p className="font-medium text-slate-200">{selectedStudent.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="p-2 bg-slate-800 rounded-lg mr-4 mt-1 text-slate-400">
                        <FiCalendar size={16} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Date Joined</p>
                        <p className="font-medium text-slate-200">
                          {new Date(selectedStudent.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Detailed Stats */}
                <div className="col-span-2">
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl">
                      <p className="text-blue-400 text-sm font-medium mb-1">Tests Taken</p>
                      <p className="text-3xl font-bold text-white">{selectedStudent.tests_taken || 0}</p>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl">
                      <p className="text-emerald-400 text-sm font-medium mb-1">Avg Score</p>
                      <p className="text-3xl font-bold text-white">{selectedStudent.avg_score || 0}%</p>
                    </div>
                    <div className="bg-violet-500/10 border border-violet-500/20 p-5 rounded-2xl">
                      <p className="text-violet-400 text-sm font-medium mb-1">Total Time</p>
                      <p className="text-3xl font-bold text-white">45<span className="text-xl text-violet-300 ml-1">hrs</span></p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl">
                      <p className="text-amber-400 text-sm font-medium mb-1">Overall Rank</p>
                      <p className="text-3xl font-bold text-white">#234</p>
                    </div>
                  </div>

                  <h4 className="font-bold text-white mb-4 text-lg">Recent Test History</h4>
                  <div className="bg-[#0f172a] rounded-xl border border-slate-700/50 overflow-hidden">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-800/50 border-b border-slate-700/50">
                        <tr>
                          <th className="px-5 py-3 text-left font-semibold text-slate-400">Test Name</th>
                          <th className="px-5 py-3 text-left font-semibold text-slate-400">Date</th>
                          <th className="px-5 py-3 text-left font-semibold text-slate-400">Score</th>
                          <th className="px-5 py-3 text-left font-semibold text-slate-400">Rank</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50">
                        {[1, 2, 3].map((i) => (
                          <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-3.5 text-slate-200 font-medium">SSC CGL Mock Test {i}</td>
                            <td className="px-5 py-3.5 text-slate-400">2024-01-0{i}</td>
                            <td className="px-5 py-3.5 text-emerald-400 font-medium">145/200</td>
                            <td className="px-5 py-3.5 text-amber-400 font-medium">#342</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;