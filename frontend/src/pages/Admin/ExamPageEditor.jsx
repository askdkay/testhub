import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import API from '../../services/api';
import {
  FiSave, FiX, FiEye, FiCopy, FiCheck,
  FiAlertCircle, FiRefreshCw, FiCode,
  FiEdit3, FiFileText, FiDownload
} from 'react-icons/fi';

function ExamPageEditor() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [jsonData, setJsonData] = useState('');
  const [htmlData, setHtmlData] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [editorMode, setEditorMode] = useState('json');
  const [activeTab, setActiveTab] = useState('basic'); // basic, pattern, dates, salary

  // ✅ SAMPLE JSON TEMPLATE - Proper structure with empty values
  const sampleJson = {
    "exam_title": "",
    "exam_full_form": "",
    "conducting_body": "",
    "official_website": "",
    "exam_language": [],
    "exam_level": "",
    "exam_category": "",
    "exam_frequency": "",

    "about_exam": {
      "overview": "",
      "purpose": "",
      "importance": "",
      "posts_under_exam": [],
      "total_stages": null,
      "selection_process": []
    },

    "eligibility_criteria": {
      "nationality": "",
      "domicile": "",
      "note": ""
    },

    "age_limit": {
      "minimum_age": null,
      "maximum_age": {
        "general": null,
        "note": ""
      },
      "age_relaxation": {
        "sc_st_obc": { "male": "", "female": "" },
        "general_female": "",
        "ex_servicemen": "",
        "physically_handicapped_general": "",
        "physically_handicapped_sc_st_obc": "",
        "widows_divorcees_deserted_women": "",
        "government_employees": "",
        "note": ""
      }
    },

    "education_qualification": {
      "minimum_qualification": "",
      "accepted_streams": [],
      "final_year_students": "",
      "equivalent_qualification": ""
    },

    "exam_pattern": {
      "stage_1": {
        "type": "",
        "purpose": "",
        "papers": null,
        "total_questions": null,
        "maximum_marks": null,
        "duration_minutes": null,
        "question_type": "",
        "negative_marking": "",
        "medium": "",
        "qualifying_nature": "",
        "paper_details": []
      },
      "stage_2": {
        "type": "",
        "purpose": "",
        "papers": null,
        "total_maximum_marks": null,
        "question_type": "",
        "duration_per_paper_hours": null,
        "medium": "",
        "negative_marking": "",
        "paper_details": []
      },
      "stage_3": {
        "type": "",
        "conducted_by": "",
        "maximum_marks": null,
        "purpose": "",
        "final_merit": ""
      }
    },

    "detailed_syllabus": {
      "stage_1": { "paper_name": "", "topics": {} },
      "stage_2": { "papers": [] },
      "stage_3": { "marks": null, "areas_tested": [] }
    },

    "application_process": {
      "mode": "",
      "portal": "",
      "steps": [],
      "application_fee": {
        "general_obc_ews": "",
        "sc_st_pwd": "",
        "note": ""
      }
    },

    "exam_centers": {
      "note": "",
      "major_centers": []
    },

    "key_dates_format": {
      "note": "",
      "notification_release": "",
      "application_start": "",
      "application_last_date": "",
      "admit_card": "",
      "stage_1_exam": "",
      "stage_1_result": "",
      "stage_2_exam": "",
      "stage_2_result": "",
      "stage_3_interview": "",
      "final_result": ""
    },

    "post_selection_training": {
      "academy_name": "",
      "location": "",
      "duration": "",
      "includes": []
    },

    "salary_and_perks": {
      "pay_scale": {
        "level": "",
        "basic_pay_starting": "",
        "total_emoluments_approx": "",
        "allowances": []
      },
      "perks": []
    },

    "career_progression": {
      "career_path": [],
      "promotion_basis": ""
    },

    "related_exams": [],

    "metadata": {
      "json_created_by": "",
      "data_based_on": "",
      "last_updated": new Date().toISOString().split('T')[0],
      "disclaimer": "",
      "helpline": "",
      "email": ""
    }
  };

  useEffect(() => {
    fetchData();
  }, [examId]);

const fetchData = async () => {
  try {
    setLoading(true);
    
    // ✅ FIXED: Use admin endpoint for exam data
    const examRes = await API.get(`/exams/admin/exams/${examId}`);
    setExam(examRes.data);
    
    // Get existing page data if any
    const pageRes = await API.get(`/examDetails/admin/pages/${examId}`).catch(() => null);
    
    if (pageRes?.data) {
      // EDIT MODE - Load existing published data
      const existingData = pageRes.data;
      setIsPublished(existingData.is_published);
      
      // Set JSON data with existing values
      setJsonData(JSON.stringify(existingData, null, 2));
      
      // Generate HTML preview
      setHtmlData(generateHTMLFromJSON(existingData));
      
    } else {
      // CREATE MODE - Load sample template with exam title
      const newData = {
        ...sampleJson,
        exam_title: examRes.data.name,
        exam_full_form: examRes.data.full_form || examRes.data.name,
        exam_id: parseInt(examId)
      };
      setJsonData(JSON.stringify(newData, null, 2));
      setHtmlData(generateHTMLFromJSON(newData));
    }
    
  } catch (error) {
    console.error('Error fetching data:', error);
    setError('Failed to load exam data. Exam ID: ' + examId + ' not found.');
  } finally {
    setLoading(false);
  }
};

  // Generate HTML preview from JSON
  const generateHTMLFromJSON = (data) => {
    let html = `
      <div style="font-family: Arial; padding: 20px; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">${data.exam_title || 'Exam Title'}</h1>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Full Form:</strong> ${data.exam_full_form || 'N/A'}</p>
          <p><strong>Conducting Body:</strong> ${data.conducting_body || 'N/A'}</p>
          <p><strong>Official Website:</strong> ${data.official_website || 'N/A'}</p>
          <p><strong>Exam Level:</strong> ${data.exam_level || 'N/A'}</p>
          <p><strong>Frequency:</strong> ${data.exam_frequency || 'N/A'}</p>
        </div>

        <h2 style="color: #444; margin-top: 30px;">📋 About Exam</h2>
        <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
          <p><strong>Overview:</strong> ${data.about_exam?.overview || 'N/A'}</p>
          <p><strong>Purpose:</strong> ${data.about_exam?.purpose || 'N/A'}</p>
          <p><strong>Total Stages:</strong> ${data.about_exam?.total_stages || 'N/A'}</p>
        </div>

        <h2 style="color: #444; margin-top: 30px;">👤 Eligibility</h2>
        <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
          <p><strong>Nationality:</strong> ${data.eligibility_criteria?.nationality || 'N/A'}</p>
          <p><strong>Domicile:</strong> ${data.eligibility_criteria?.domicile || 'N/A'}</p>
        </div>

        <h2 style="color: #444; margin-top: 30px;">📅 Important Dates</h2>
        <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
          <p><strong>Notification:</strong> ${data.key_dates_format?.notification_release || 'N/A'}</p>
          <p><strong>Application Start:</strong> ${data.key_dates_format?.application_start || 'N/A'}</p>
          <p><strong>Last Date:</strong> ${data.key_dates_format?.application_last_date || 'N/A'}</p>
          <p><strong>Exam Date:</strong> ${data.key_dates_format?.stage_1_exam || 'N/A'}</p>
        </div>

        <h2 style="color: #444; margin-top: 30px;">💰 Salary & Perks</h2>
        <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
          <p><strong>Pay Level:</strong> ${data.salary_and_perks?.pay_scale?.level || 'N/A'}</p>
          <p><strong>Basic Pay:</strong> ${data.salary_and_perks?.pay_scale?.basic_pay_starting || 'N/A'}</p>
        </div>
      </div>
    `;
    return html;
  };

  const validateJSON = () => {
    try {
      JSON.parse(jsonData);
      return true;
    } catch (e) {
      setError('Invalid JSON format: ' + e.message);
      return false;
    }
  };

  // Replace the handleSubmit function
const handleSave = async (publish = false) => {
    if (editorMode === 'json' && !validateJSON()) return;
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
        let parsedData;
        if (editorMode === 'json') {
            parsedData = JSON.parse(jsonData);
        } else {
            parsedData = parseHTMLToJSON(htmlData);
        }
        
        // Create FormData to send file
        const formData = new FormData();
        
        // Convert JSON to Blob and append as file
        const jsonBlob = new Blob([JSON.stringify(parsedData, null, 2)], { type: 'application/json' });
        formData.append('jsonFile', jsonBlob, `exam-${examId}.json`);
        
        // Add other fields
        formData.append('exam_title', parsedData.exam_title || exam?.name);
        formData.append('exam_full_form', parsedData.exam_full_form || '');
        formData.append('conducting_body', parsedData.conducting_body || '');
        formData.append('official_website', parsedData.official_website || '');
        formData.append('exam_language', JSON.stringify(parsedData.exam_language || []));
        formData.append('exam_level', parsedData.exam_level || '');
        formData.append('exam_category', parsedData.exam_category || '');
        formData.append('exam_frequency', parsedData.exam_frequency || '');
        formData.append('is_published', publish);
        
        await API.post(`/examDetails/admin/pages/${examId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setIsPublished(publish);
        setSuccess(publish ? 'Page published successfully to Cloudinary!' : 'Draft saved to Cloudinary!');
        fetchData();
        
        setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
        console.error('Error saving page:', error);
        setError('Failed to save page: ' + (error.response?.data?.message || error.message));
    } finally {
        setSaving(false);
    }
};

  const handlePreview = () => {
    if (!validateJSON()) return;
    const data = JSON.parse(jsonData);

    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
      <html>
        <head>
          <title>Preview: ${data.exam_title}</title>
          <style>
            body { font-family: Arial; padding: 20px; background: #f5f5f5; }
            .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
            h2 { color: #444; margin-top: 30px; }
            .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; }
            pre { background: #f8f8f8; padding: 10px; border-radius: 5px; overflow: auto; display: none; }
          </style>
        </head>
        <body>
          <div class="container">
            ${generateHTMLFromJSON(data)}
            <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px;">
              <h3>🔍 Raw JSON Data:</h3>
              <pre>${JSON.stringify(data, null, 2)}</pre>
            </div>
          </div>
        </body>
      </html>
    `);
  };

  const loadSampleData = () => {
    const sample = {
      ...sampleJson,
      exam_title: exam?.name || "Sample Exam",
      exam_full_form: exam?.full_form || "Sample Full Form",
      about_exam: {
        overview: "This is a sample overview of the exam. It describes what the exam is about and its importance.",
        purpose: "The purpose of this exam is to select candidates for various government positions.",
        importance: "This is one of the most prestigious exams in the country.",
        total_stages: 3
      },
      eligibility_criteria: {
        nationality: "Indian",
        domicile: "Any state",
        note: "Candidates must be citizens of India"
      },
      age_limit: {
        minimum_age: 21,
        maximum_age: { general: 32 },
        age_relaxation: {
          sc_st_obc: { male: "5 years", female: "5 years" },
          general_female: "5 years"
        }
      },
      key_dates_format: {
        notification_release: "March 2025",
        application_start: "April 2025",
        application_last_date: "May 2025",
        stage_1_exam: "June 2025"
      },
      salary_and_perks: {
        pay_scale: {
          level: "Level 7",
          basic_pay_starting: "₹44,900",
          allowances: ["DA", "HRA", "TA"]
        }
      }
    };
    setJsonData(JSON.stringify(sample, null, 2));
    setHtmlData(generateHTMLFromJSON(sample));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/exam-pages')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiX size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {exam?.name || 'Exam Page Editor'}
                {isPublished && <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Published</span>}
              </h1>
              <p className="text-sm text-gray-400">ID: {examId}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {/* Editor Mode Toggle */}
            <div className="flex p-1 bg-gray-800 rounded-lg mr-2">
              <button
                onClick={() => setEditorMode('json')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${editorMode === 'json' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <FiCode size={14} />
                JSON
              </button>
              <button
                onClick={() => {
                  setEditorMode('html');
                  try {
                    const data = JSON.parse(jsonData);
                    setHtmlData(generateHTMLFromJSON(data));
                  } catch (e) { }
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${editorMode === 'html' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
              >
                <FiEdit3 size={14} />
                Preview
              </button>
            </div>

            <button
              onClick={loadSampleData}
              className="px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-1 text-sm"
              title="Load Sample Data"
            >
              <FiFileText size={14} />
              Sample
            </button>

            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FiEye />
              Preview
            </button>

            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <FiSave />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FiCheck />
              {isPublished ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 flex items-center gap-2">
            <FiAlertCircle />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 flex items-center gap-2">
            <FiCheck />
            {success}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 border-b border-gray-800 pb-2">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'basic' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('eligibility')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'eligibility' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
          >
            Eligibility & Age
          </button>
          <button
            onClick={() => setActiveTab('pattern')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'pattern' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
          >
            Exam Pattern
          </button>
          <button
            onClick={() => setActiveTab('dates')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'dates' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
          >
            Important Dates
          </button>
          <button
            onClick={() => setActiveTab('salary')}
            className={`px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'salary' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
          >
            Salary & Perks
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Editor */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">
                  {editorMode === 'json' ? '📝 JSON Editor' : '👁️ HTML Preview'}
                </h2>
                {editorMode === 'json' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        try {
                          const data = JSON.parse(jsonData);
                          data.metadata.last_updated = new Date().toISOString().split('T')[0];
                          setJsonData(JSON.stringify(data, null, 2));
                        } catch (e) { }
                      }}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Update timestamp"
                    >
                      <FiRefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(jsonData);
                        alert('JSON copied to clipboard!');
                      }}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Copy JSON"
                    >
                      <FiCopy size={16} />
                    </button>
                  </div>
                )}
              </div>

              {editorMode === 'json' ? (
                <textarea
                  value={jsonData}
                  onChange={(e) => {
                    setJsonData(e.target.value);
                    setError('');
                  }}
                  className="w-full h-[calc(100vh-400px)] bg-gray-950 border border-gray-700 rounded-lg p-4 font-mono text-sm text-gray-300 focus:outline-none focus:border-blue-500/50"
                  spellCheck="false"
                  placeholder="Paste your JSON here or click 'Sample' to load template..."
                />
              ) : (
                <div
                  className="w-full h-[calc(100vh-400px)] bg-gray-950 border border-gray-700 rounded-lg p-4 overflow-y-auto text-gray-300"
                  dangerouslySetInnerHTML={{ __html: htmlData }}
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <FiFileText className="text-blue-400" />
                Exam Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">ID:</span>
                  <span className="text-blue-400 font-mono">{examId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={isPublished ? 'text-green-400' : 'text-yellow-400'}>
                    {isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Slug:</span>
                  <span className="text-purple-400">/{exam?.slug}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    const emptyJson = JSON.stringify(sampleJson, null, 2);
                    setJsonData(emptyJson);
                  }}
                  className="w-full p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors text-left"
                >
                  📄 Load Empty Template
                </button>
                <button
                  onClick={loadSampleData}
                  className="w-full p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors text-left"
                >
                  🎯 Load Sample Data
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(sampleJson, null, 2));
                    alert('Template copied!');
                  }}
                  className="w-full p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors text-left"
                >
                  📋 Copy Template
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">💡 Tips</h3>
              <ul className="text-xs text-gray-400 space-y-2 list-disc pl-4">
                <li>Use "Sample" button to see example data</li>
                <li>Edit only the values, keep the structure</li>
                <li>Preview before publishing</li>
                <li>Save as Draft anytime</li>
                <li>All fields are optional</li>
              </ul>
            </div>

            {/* View Live */}
            {exam?.slug && isPublished && (
              <a
                href={`/exam/${exam.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-blue-400 transition-colors text-center"
              >
                <FiEye className="inline mr-2" />
                View Live Page
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamPageEditor;