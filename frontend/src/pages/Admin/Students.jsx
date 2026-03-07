import { useState, useEffect } from 'react';
import API from '../../services/api';
import { 
  FiSearch, FiFilter, FiDownload, FiEye, 
  FiEdit2, FiTrash2, FiLock, FiUnlock,
  FiMail, FiPhone, FiCalendar, FiAward,
  FiActivity, FiBarChart2
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
    <div className="min-h-screen bg-gray-50 ml-64 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
          <p className="text-gray-500 mt-1">Manage all registered students</p>
        </div>
        <div className="flex space-x-4">
          <button className="btn-success flex items-center">
            <FiDownload className="mr-2" />
            Export List
          </button>
          <button className="btn-primary">
            Send Bulk Email
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">All Students</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
          </select>
          
          <button className="btn-primary flex items-center">
            <FiFilter className="mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Students</p>
              <h3 className="text-2xl font-bold mt-1">1,234</h3>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiUsers className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-green-600 text-sm mt-2">↑ 12% this month</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Today</p>
              <h3 className="text-2xl font-bold mt-1">456</h3>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiActivity className="text-green-600" size={24} />
            </div>
          </div>
          <p className="text-green-600 text-sm mt-2">↑ 8% from yesterday</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Premium Users</p>
              <h3 className="text-2xl font-bold mt-1">789</h3>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiAward className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-purple-600 text-sm mt-2">64% conversion rate</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Blocked</p>
              <h3 className="text-2xl font-bold mt-1">23</h3>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiLock className="text-red-600" size={24} />
            </div>
          </div>
          <p className="text-red-600 text-sm mt-2">↓ 3 new blocks</p>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Student</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Exam Prep</th>
                <th className="table-header">Tests Taken</th>
                <th className="table-header">Avg Score</th>
                <th className="table-header">Joined</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="flex items-center">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${student.name}&background=2563eb&color=fff`}
                        alt={student.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-gray-500">ID: STU{student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <p className="flex items-center text-sm">
                        <FiMail className="mr-2 text-gray-400" size={14} />
                        {student.email}
                      </p>
                      <p className="flex items-center text-sm">
                        <FiPhone className="mr-2 text-gray-400" size={14} />
                        {student.phone || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {student.exam_preparation || 'Not Set'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <FiBarChart2 className="mr-2 text-gray-400" />
                      <span>{student.tests_taken || 0}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${student.avg_score || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">{student.avg_score || 0}%</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center text-sm">
                      <FiCalendar className="mr-2 text-gray-400" size={14} />
                      {new Date(student.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.status === 'active' ? 'bg-green-100 text-green-800' :
                      student.status === 'blocked' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.status || 'Active'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowProfile(true);
                        }}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600"
                        title="View Profile"
                      >
                        <FiEye size={16} />
                      </button>
                      <button className="p-1 hover:bg-green-100 rounded text-green-600" title="Edit">
                        <FiEdit2 size={16} />
                      </button>
                      <button className="p-1 hover:bg-yellow-100 rounded text-yellow-600" title="Block/Unblock">
                        {student.status === 'blocked' ? <FiUnlock size={16} /> : <FiLock size={16} />}
                      </button>
                      <button className="p-1 hover:bg-red-100 rounded text-red-600" title="Delete">
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
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-500">Showing 1-10 of {students.length} students</p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded hover:bg-gray-50">Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded">1</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>

      {/* Student Profile Modal */}
      {showProfile && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Student Profile</h2>
                <button 
                  onClick={() => setShowProfile(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Profile Content */}
              <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Basic Info */}
                <div className="col-span-1">
                  <div className="text-center mb-6">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${selectedStudent.name}&size=128&background=2563eb&color=fff`}
                      alt={selectedStudent.name}
                      className="w-32 h-32 rounded-full mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                    <p className="text-gray-500">ID: STU{selectedStudent.id}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <FiMail className="mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedStudent.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FiPhone className="mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedStudent.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Joined</p>
                        <p className="font-medium">
                          {new Date(selectedStudent.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Detailed Stats */}
                <div className="col-span-2">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-600 text-sm">Tests Taken</p>
                      <p className="text-2xl font-bold">{selectedStudent.tests_taken || 0}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-600 text-sm">Avg Score</p>
                      <p className="text-2xl font-bold">{selectedStudent.avg_score || 0}%</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-purple-600 text-sm">Total Time</p>
                      <p className="text-2xl font-bold">45h</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-yellow-600 text-sm">Rank</p>
                      <p className="text-2xl font-bold">#234</p>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-4">Recent Test History</h4>
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Test Name</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Score</th>
                        <th className="px-4 py-2 text-left">Rank</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3].map((i) => (
                        <tr key={i} className="border-t">
                          <td className="px-4 py-2">SSC CGL Mock Test {i}</td>
                          <td className="px-4 py-2">2024-01-{i}</td>
                          <td className="px-4 py-2">145/200</td>
                          <td className="px-4 py-2">#342</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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