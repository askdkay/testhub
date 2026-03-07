import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

function TakeTest() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadTest();
    }, [id]);

    useEffect(() => {
        if (test && test.duration) {
            setTimeLeft(test.duration * 60); // Convert to seconds
        }
    }, [test]);

    // Timer
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && test) {
            handleSubmit();
        }
    }, [timeLeft]);

    const loadTest = async () => {
    try {
        setLoading(true);
        
        // Check token
        const token = localStorage.getItem('token');
        console.log('Current token:', token); // DEBUG LINE
        
        const res = await API.get(`/tests/${id}`);
        console.log('Test data loaded:', res.data);
        
        if (!res.data.questions) {
            res.data.questions = [];
        }
        
        setTest(res.data);
        setError('');
    } catch (error) {
        console.error('Error loading test:', error);
        console.error('Error response:', error.response?.data); // DEBUG LINE
        setError('Failed to load test. Please try again.');
    } finally {
        setLoading(false);
    }
};

    const handleAnswer = (questionId, answer) => {
        setAnswers({
            ...answers,
            [questionId]: answer
        });
    };

    const handleSubmit = async () => {
        if (!test || !test.questions) {
            alert('Test data not available');
            return;
        }

        // Calculate score
        let score = 0;
        test.questions.forEach(q => {
            if (answers[q.id] === q.correct_answer) {
                score += 4; // 4 marks per question
            }
        });

        // Show result
        alert(`Test completed! Your score: ${score}/${test.questions.length * 4}`);
        navigate('/tests');
    };

    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '50px',
                fontSize: '1.2rem',
                color: '#666'
            }}>
                Loading test...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '50px',
                color: 'red'
            }}>
                <h2>Error</h2>
                <p>{error}</p>
                <button 
                    onClick={() => navigate('/tests')}
                    style={{
                        padding: '10px 20px',
                        marginTop: '20px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Tests
                </button>
            </div>
        );
    }

    if (!test) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Test not found</h2>
                <button 
                    onClick={() => navigate('/tests')}
                    style={{
                        padding: '10px 20px',
                        marginTop: '20px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Tests
                </button>
            </div>
        );
    }

    if (!test.questions || test.questions.length === 0) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '50px',
                maxWidth: '600px',
                margin: '0 auto'
            }}>
                <h2 style={{ color: '#f59e0b', marginBottom: '1rem' }}>
                    No Questions Added Yet
                </h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                    This test doesn't have any questions. Please check back later.
                </p>
                <button 
                    onClick={() => navigate('/tests')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Browse Other Tests
                </button>
            </div>
        );
    }

    const question = test.questions[currentQuestion];
    
    // Safety check - if question is undefined
    if (!question) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Question not found</h2>
                <button onClick={() => navigate('/tests')}>Back to Tests</button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
            }}>
                <h2>{test.title}</h2>
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: timeLeft < 300 ? 'red' : '#333'
                }}>
                    ⏱️ {formatTime(timeLeft)}
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                marginBottom: '2rem'
            }}>
                <div style={{
                    width: `${((currentQuestion + 1) / test.questions.length) * 100}%`,
                    height: '100%',
                    backgroundColor: '#2563eb',
                    borderRadius: '4px',
                    transition: 'width 0.3s'
                }} />
            </div>

            {/* Question Number */}
            <div style={{ marginBottom: '1rem', color: '#666' }}>
                Question {currentQuestion + 1} of {test.questions.length}
            </div>

            {/* Question */}
            <div style={{
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
            }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                    {question.question_text}
                </h3>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {['A', 'B', 'C', 'D'].map(option => {
                        const optionText = question[`option_${option.toLowerCase()}`];
                        return (
                            <label
                                key={option}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    border: `2px solid ${answers[question.id] === option ? '#2563eb' : '#e0e0e0'}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    backgroundColor: answers[question.id] === option ? '#eff6ff' : 'white',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option}
                                    checked={answers[question.id] === option}
                                    onChange={() => handleAnswer(question.id, option)}
                                    style={{ marginRight: '1rem' }}
                                />
                                <span style={{ fontWeight: 'bold', marginRight: '1rem' }}>{option}.</span>
                                <span>{optionText}</span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem'
            }}>
                <button
                    onClick={() => setCurrentQuestion(curr => Math.max(0, curr - 1))}
                    disabled={currentQuestion === 0}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: currentQuestion === 0 ? '#ccc' : '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    ← Previous
                </button>

                {currentQuestion === test.questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Submit Test
                    </button>
                ) : (
                    <button
                        onClick={() => setCurrentQuestion(curr => curr + 1)}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Next →
                    </button>
                )}
            </div>

            {/* Question Palette */}
            {test.questions.length > 0 && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                }}>
                    <h4 style={{ marginBottom: '1rem' }}>Question Palette</h4>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(10, 1fr)',
                        gap: '0.5rem'
                    }}>
                        {test.questions.map((q, index) => (
                            <button
                                key={q.id || index}
                                onClick={() => setCurrentQuestion(index)}
                                style={{
                                    padding: '0.5rem',
                                    backgroundColor: answers[q?.id] ? '#10b981' : (currentQuestion === index ? '#2563eb' : '#e0e0e0'),
                                    color: answers[q?.id] || currentQuestion === index ? 'white' : '#333',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TakeTest;