import { useNavigate } from 'react-router-dom';

function TestCard({ test }) {
    const navigate = useNavigate();

    return (
        <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            padding: '1.5rem',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
        }}
        onClick={() => navigate(`/test/${test.id}`)}
        >
            <h3 style={{ marginBottom: '1rem', color: '#333' }}>{test.title}</h3>
            
            <div style={{ marginBottom: '1rem' }}>
                <span style={{
                    backgroundColor: test.is_free ? '#10b981' : '#f59e0b',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    display: 'inline-block'
                }}>
                    {test.is_free ? 'FREE' : `₹${test.price}`}
                </span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', color: '#666', fontSize: '0.9rem' }}>
                <span>⏱️ {test.duration} mins</span>
                <span>📝 {test.total_questions || 0} questions</span>
                <span>📊 {test.category || 'General'}</span>
            </div>
            
            {test.description && (
                <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    {test.description.substring(0, 100)}...
                </p>
            )}
            
            <button style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: test.is_free ? '#10b981' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                width: '100%'
            }}>
                {test.is_free ? 'Start Free Test' : 'Buy Now'}
            </button>
        </div>
    );
}

export default TestCard;