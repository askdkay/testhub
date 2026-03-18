import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import API from '../../services/api';
import { 
  FiCalendar, FiClock, FiBookOpen, FiAward,
  FiUsers, FiMapPin, FiDollarSign, FiTrendingUp,
  FiGlobe, FiFileText, FiVideo, FiDownload,
  FiChevronRight, FiExternalLink
} from 'react-icons/fi';
import { FaGraduationCap, FaRegClock, FaRegFileAlt } from 'react-icons/fa';

function ExamDetailPage() {
  const { slug } = useParams();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchExamData();
  }, [slug]);

  const fetchExamData = async () => {
    try {
      const res = await API.get(`/examDetails/exam/${slug}`);
      setExamData(res.data);
    } catch (error) {
      console.error('Error fetching exam data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseJSON = (data) => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return {};
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-2">Exam Details Not Found</h2>
          <Link to="/exams" className="text-blue-400 hover:underline">
            Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  const about = parseJSON(examData.about_exam);
  const eligibility = parseJSON(examData.eligibility_criteria);
  const age = parseJSON(examData.age_limit);
  const education = parseJSON(examData.education_qualification);
  const pattern = parseJSON(examData.exam_pattern);
  const syllabus = parseJSON(examData.detailed_syllabus);
  const application = parseJSON(examData.application_process);
  const dates = parseJSON(examData.key_dates_format);
  const salary = parseJSON(examData.salary_and_perks);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <FiBookOpen /> },
    { id: 'syllabus', name: 'Syllabus & Pattern', icon: <FiFileText /> },
    { id: 'tests', name: 'Test Series', icon: <FiAward /> },
    { id: 'material', name: 'Study Material', icon: <FiVideo /> }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-24 pb-12 px-4 bg-gradient-to-b from-blue-500/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <Link to="/exams" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
            ← Back to Exams
          </Link>
          
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {examData.exam_title}
              </h1>
              {examData.exam_full_form && (
                <p className="text-xl text-gray-400 mb-4">{examData.exam_full_form}</p>
              )}
              
              <div className="flex flex-wrap gap-4">
                {examData.conducting_body && (
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                    {examData.conducting_body}
                  </span>
                )}
                {examData.exam_level && (
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm">
                    {examData.exam_level}
                  </span>
                )}
                {examData.exam_frequency && (
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">
                    {examData.exam_frequency}
                  </span>
                )}
              </div>
            </div>

            {examData.official_website && (
              <a
                href={examData.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
              >
                <FiGlobe />
                Official Website
                <FiExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* About Exam */}
            {about.overview && (
              <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">About the Exam</h2>
                <p className="text-gray-300 leading-relaxed">{about.overview}</p>
                {about.purpose && (
                  <p className="text-gray-300 mt-4">{about.purpose}</p>
                )}
              </section>
            )}

            {/* Eligibility Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Eligibility */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FiUsers className="text-blue-400" />
                  Eligibility
                </h3>
                <div className="space-y-2 text-sm">
                  {eligibility.nationality && (
                    <p><span className="text-gray-400">Nationality:</span> {eligibility.nationality}</p>
                  )}
                  {education.minimum_qualification && (
                    <p><span className="text-gray-400">Qualification:</span> {education.minimum_qualification}</p>
                  )}
                </div>
              </div>

              {/* Age Limit */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FaRegClock className="text-green-400" />
                  Age Limit
                </h3>
                <div className="space-y-2 text-sm">
                  {age.minimum_age && (
                    <p><span className="text-gray-400">Minimum:</span> {age.minimum_age} years</p>
                  )}
                  {age.maximum_age?.general && (
                    <p><span className="text-gray-400">Maximum (General):</span> {age.maximum_age.general} years</p>
                  )}
                </div>
              </div>

              {/* Application Fee */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FiDollarSign className="text-yellow-400" />
                  Application Fee
                </h3>
                <div className="space-y-2 text-sm">
                  {application.application_fee?.general_obc_ews && (
                    <p><span className="text-gray-400">General/OBC:</span> {application.application_fee.general_obc_ews}</p>
                  )}
                  {application.application_fee?.sc_st_pwd && (
                    <p><span className="text-gray-400">SC/ST/PwD:</span> {application.application_fee.sc_st_pwd}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Key Dates */}
            {dates.notification_release && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FiCalendar className="text-orange-400" />
                  Important Dates
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {dates.notification_release && (
                    <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-400">Notification</span>
                      <span className="text-white">{dates.notification_release}</span>
                    </div>
                  )}
                  {dates.application_start && (
                    <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-400">Application Start</span>
                      <span className="text-white">{dates.application_start}</span>
                    </div>
                  )}
                  {dates.application_last_date && (
                    <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-400">Last Date</span>
                      <span className="text-white">{dates.application_last_date}</span>
                    </div>
                  )}
                  {dates.stage_1_exam && (
                    <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg">
                      <span className="text-gray-400">Prelims Exam</span>
                      <span className="text-white">{dates.stage_1_exam}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Salary & Perks */}
            {salary.pay_scale && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Salary & Perks</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {salary.pay_scale.level && (
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <p className="text-gray-400 text-sm">Pay Level</p>
                      <p className="text-xl font-bold text-white">{salary.pay_scale.level}</p>
                    </div>
                  )}
                  {salary.pay_scale.basic_pay_starting && (
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <p className="text-gray-400 text-sm">Basic Pay</p>
                      <p className="text-xl font-bold text-white">₹{salary.pay_scale.basic_pay_starting}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Syllabus & Pattern Tab */}
        {activeTab === 'syllabus' && (
          <div className="space-y-8">
            {/* Exam Pattern */}
            {pattern.stage_1 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Exam Pattern</h2>
                
                {/* Stage 1 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Stage 1: {pattern.stage_1.type}</h3>
                  <div className="grid md:grid-cols-4 gap-3">
                    {pattern.stage_1.total_questions && (
                      <div className="p-3 bg-gray-800/50 rounded-lg">
                        <p className="text-gray-400 text-xs">Questions</p>
                        <p className="text-white font-semibold">{pattern.stage_1.total_questions}</p>
                      </div>
                    )}
                    {pattern.stage_1.maximum_marks && (
                      <div className="p-3 bg-gray-800/50 rounded-lg">
                        <p className="text-gray-400 text-xs">Marks</p>
                        <p className="text-white font-semibold">{pattern.stage_1.maximum_marks}</p>
                      </div>
                    )}
                    {pattern.stage_1.duration_minutes && (
                      <div className="p-3 bg-gray-800/50 rounded-lg">
                        <p className="text-gray-400 text-xs">Duration</p>
                        <p className="text-white font-semibold">{pattern.stage_1.duration_minutes} min</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stage 2 */}
                {pattern.stage_2 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-green-400 mb-3">Stage 2: {pattern.stage_2.type}</h3>
                    {pattern.stage_2.paper_details?.map((paper, idx) => (
                      <div key={idx} className="p-3 bg-gray-800/30 rounded-lg mb-2">
                        <p className="font-medium text-white">Paper {paper.paper_no}: {paper.subject}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span className="text-gray-400">Marks: {paper.marks}</span>
                          <span className="text-gray-400">Duration: {paper.duration_hours} hours</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Syllabus */}
            {syllabus.stage_1 && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Detailed Syllabus</h2>
                <pre className="text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(syllabus, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Test Series Tab */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Available Test Series</h2>
            {examData.test_series?.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {examData.test_series.map(test => (
                  <Link
                    key={test.id}
                    to={`/test/${test.id}`}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors"
                  >
                    <h3 className="font-semibold text-white mb-2">{test.title}</h3>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{test.total_questions} questions</span>
                      <span>{test.duration} min</span>
                    </div>
                    <div className="mt-4 text-lg font-bold text-blue-400">
                      {test.is_free ? 'FREE' : `₹${test.price}`}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No test series available yet.</p>
            )}
          </div>
        )}

        {/* Study Material Tab */}
        {activeTab === 'material' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Study Material</h2>
            {examData.study_material?.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {examData.study_material.map(material => (
                  <Link
                    key={material.id}
                    to={`/blogs/${material.id}`}
                    className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <FaRegFileAlt className="text-purple-400 text-xl mt-1" />
                      <div>
                        <h3 className="font-semibold text-white">{material.title}</h3>
                        <p className="text-sm text-gray-400 mt-1">{material.views} views</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No study material available yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExamDetailPage;