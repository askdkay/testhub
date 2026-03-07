import { useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../services/api';
import { FiUpload, FiPlus, FiTrash2, FiCopy, FiCheck } from 'react-icons/fi';
import * as XLSX from 'xlsx';

function AddQuestions() {
  const { testId } = useParams();
  const [questions, setQuestions] = useState([
    {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      explanation: ''
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation: ''
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      
      // Convert Excel format to our format
      const newQuestions = json.map(row => ({
        question_text: row.Question || row.question || '',
        option_a: row['Option A'] || row.option_a || '',
        option_b: row['Option B'] || row.option_b || '',
        option_c: row['Option C'] || row.option_c || '',
        option_d: row['Option D'] || row.option_d || '',
        correct_answer: row['Correct Answer'] || row.correct_answer || 'A',
        explanation: row.Explanation || row.explanation || ''
      }));
      
      setQuestions([...questions, ...newQuestions]);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 2000);
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await API.post('/admin/questions', {
        testId,
        questions
      });
      alert('Questions added successfully!');
    } catch (error) {
      console.error('Error adding questions:', error);
      alert('Failed to add questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 ml-64 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add Questions</h1>
            <p className="text-gray-500 mt-1">Test ID: {testId}</p>
          </div>
          
          <div className="flex space-x-4">
            {/* Bulk Upload */}
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <button className="btn-success flex items-center px-4">
                <FiUpload className="mr-2" />
                Bulk Upload
              </button>
            </div>
            
            <button
              onClick={addQuestion}
              className="btn-primary flex items-center"
            >
              <FiPlus className="mr-2" />
              Add Question
            </button>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={index} className="card relative">
              {/* Question Number & Actions */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Question #{index + 1}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const copy = { ...q };
                      setQuestions([...questions, copy]);
                    }}
                    className="p-2 hover:bg-gray-100 rounded text-gray-600"
                    title="Duplicate"
                  >
                    <FiCopy size={18} />
                  </button>
                  <button
                    onClick={() => removeQuestion(index)}
                    className="p-2 hover:bg-red-100 rounded text-red-600"
                    title="Delete"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Question Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Text *
                  </label>
                  <textarea
                    rows="2"
                    value={q.question_text}
                    onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                    className="input-field"
                    placeholder="Enter your question here..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option A *
                    </label>
                    <input
                      type="text"
                      value={q.option_a}
                      onChange={(e) => handleQuestionChange(index, 'option_a', e.target.value)}
                      className="input-field"
                      placeholder="Option A"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option B *
                    </label>
                    <input
                      type="text"
                      value={q.option_b}
                      onChange={(e) => handleQuestionChange(index, 'option_b', e.target.value)}
                      className="input-field"
                      placeholder="Option B"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option C *
                    </label>
                    <input
                      type="text"
                      value={q.option_c}
                      onChange={(e) => handleQuestionChange(index, 'option_c', e.target.value)}
                      className="input-field"
                      placeholder="Option C"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Option D *
                    </label>
                    <input
                      type="text"
                      value={q.option_d}
                      onChange={(e) => handleQuestionChange(index, 'option_d', e.target.value)}
                      className="input-field"
                      placeholder="Option D"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer *
                    </label>
                    <select
                      value={q.correct_answer}
                      onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks
                    </label>
                    <input
                      type="number"
                      value="4"
                      disabled
                      className="input-field bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Explanation (Optional)
                  </label>
                  <textarea
                    rows="2"
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                    className="input-field"
                    placeholder="Explain why this answer is correct..."
                  />
                </div>
              </div>

              {/* Status Indicator */}
              {q.question_text && q.option_a && (
                <div className="absolute top-4 right-16">
                  <FiCheck className="text-green-600" size={20} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary px-8 py-3 text-lg"
          >
            {loading ? 'Saving...' : `Save ${questions.length} Questions`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddQuestions;