import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

function AddQuestions() {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState('');
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
    const [error, setError] = useState('');

    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {
        try {
            const res = await API.get('/tests');
            setTests(res.data);
        } catch (error) {
            console.error('Error loading tests:', error);
        }
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTest) {
            setError('Please select a test');
            return;
        }

        setLoading(true);

        try {
            await API.post('/admin/questions', {
                testId: selectedTest,
                questions
            });
            alert('Questions added successfully!');
            navigate('/admin');
        } catch (error) {
            setError(error.response?.data?.message || 'Error adding questions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Add Questions</h1>

            {error && (
                <div style={{
                    color: 'red',
                    padding: '1rem',
                    backgroundColor: '#fee',
                    borderRadius: '5px',
                    marginBottom: '1rem'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Test Selection */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Select Test *
                    </label>
                    <select
                        value={selectedTest}
                        onChange={(e) => setSelectedTest(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '1rem'
                        }}
                    >
                        <option value="">Choose a test...</option>
                        {tests.map(test => (
                            <option key={test.id} value={test.id}>
                                {test.title} ({test.questions_count || 0} questions)
                            </option>
                        ))}
                    </select>
                </div>

                {/* Questions */}
                {questions.map((q, index) => (
                    <div key={index} style={{
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '10px',
                        border: '1px solid #e0e0e0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ color: '#2563eb' }}>Question {index + 1}</h3>
                            {questions.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(index)}
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        {/* Question Text */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                                Question Text *
                            </label>
                            <textarea
                                value={q.question_text}
                                onChange={(e) => handleQuestionChange(index, 'question_text', e.target.value)}
                                required
                                rows="2"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '5px'
                                }}
                                placeholder="Enter question..."
                            />
                        </div>

                        {/* Options */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Option A *</label>
                                <input
                                    type="text"
                                    value={q.option_a}
                                    onChange={(e) => handleQuestionChange(index, 'option_a', e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Option B *</label>
                                <input
                                    type="text"
                                    value={q.option_b}
                                    onChange={(e) => handleQuestionChange(index, 'option_b', e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Option C *</label>
                                <input
                                    type="text"
                                    value={q.option_c}
                                    onChange={(e) => handleQuestionChange(index, 'option_c', e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Option D *</label>
                                <input
                                    type="text"
                                    value={q.option_d}
                                    onChange={(e) => handleQuestionChange(index, 'option_d', e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Correct Answer and Explanation */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Correct Answer *</label>
                                <select
                                    value={q.correct_answer}
                                    onChange={(e) => handleQuestionChange(index, 'correct_answer', e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px'
                                    }}
                                >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.25rem' }}>Explanation</label>
                                <input
                                    type="text"
                                    value={q.explanation}
                                    onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px'
                                    }}
                                    placeholder="Optional explanation..."
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add Question Button */}
                <button
                    type="button"
                    onClick={addQuestion}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}
                >
                    + Add Another Question
                </button>

                {/* Submit Buttons */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Saving...' : 'Save All Questions'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        style={{
                            padding: '0.75rem 2rem',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddQuestions;