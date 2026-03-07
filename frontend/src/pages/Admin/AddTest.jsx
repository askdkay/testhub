import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

function AddTest() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: 60,
        category: 'SSC',
        is_free: true,
        price: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await API.post('/admin/tests', formData);
            alert('Test created successfully!');
            navigate('/admin');
        } catch (error) {
            setError(error.response?.data?.message || 'Error creating test');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Add New Test</h1>
            
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
            
            <form onSubmit={handleSubmit} style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Test Title *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '1rem'
                        }}
                        placeholder="e.g., SSC CGL Mock Test 1"
                    />
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '5px',
                            fontSize: '1rem'
                        }}
                        placeholder="Test description..."
                    />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Duration (minutes) *
                        </label>
                        <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            required
                            min="1"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '5px'
                            }}
                        />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '5px'
                            }}
                        >
                            <option value="SSC">SSC CGL/CHSL</option>
                            <option value="UPSC">UPSC</option>
                            <option value="Banking">Banking</option>
                            <option value="Railway">Railway</option>
                            <option value="Defence">Defence</option>
                            <option value="State PSC">State PSC</option>
                            <option value="Teaching">Teaching</option>
                        </select>
                    </div>
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            name="is_free"
                            checked={formData.is_free}
                            onChange={handleChange}
                        />
                        <span style={{ fontWeight: 'bold' }}>Free Test</span>
                    </label>
                </div>
                
                {!formData.is_free && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Price (₹) *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required={!formData.is_free}
                            min="1"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '5px'
                            }}
                        />
                    </div>
                )}
                
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
                        {loading ? 'Creating...' : 'Create Test'}
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

export default AddTest;