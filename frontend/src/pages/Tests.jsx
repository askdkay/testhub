import { useState, useEffect } from 'react';
import API from '../services/api';
import TestCard from '../components/TestCard';

function Tests() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, free, paid
    const [category, setCategory] = useState('all');

    useEffect(() => {
        loadTests();
    }, []);

    const loadTests = async () => {
        try {
            const res = await API.get('/tests');
            setTests(res.data);
        } catch (error) {
            console.error('Error loading tests:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter tests
    const filteredTests = tests.filter(test => {
        if (filter === 'free' && !test.is_free) return false;
        if (filter === 'paid' && test.is_free) return false;
        if (category !== 'all' && test.category !== category) return false;
        return true;
    });

    // Unique categories for filter
    const categories = ['all', ...new Set(tests.map(t => t.category).filter(Boolean))];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Loading tests...</h2>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Available Test Series</h1>
            
            {/* Filters */}
            <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginBottom: '2rem',
                flexWrap: 'wrap'
            }}>
                <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '5px'
                    }}
                >
                    <option value="all">All Tests</option>
                    <option value="free">Free Tests</option>
                    <option value="paid">Paid Tests</option>
                </select>
                
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid #ddd',
                        borderRadius: '5px'
                    }}
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat === 'all' ? 'All Categories' : cat}
                        </option>
                    ))}
                </select>
            </div>
            
            {/* Tests Grid */}
            {filteredTests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h3>No tests found</h3>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {filteredTests.map(test => (
                        <TestCard key={test.id} test={test} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Tests;