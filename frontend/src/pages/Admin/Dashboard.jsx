import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/');
            return;
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [usersRes, testsRes] = await Promise.all([
                API.get('/admin/users'),
                API.get('/tests')
            ]);
            setUsers(usersRes.data);
            setTests(testsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Admin Dashboard</h1>
            
            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    borderRadius: '10px'
                }}>
                    <h3>Total Users</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{users.length}</p>
                </div>
                
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '10px'
                }}>
                    <h3>Total Tests</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{tests.length}</p>
                </div>
                
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    borderRadius: '10px'
                }}>
                    <h3>Free Tests</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {tests.filter(t => t.is_free).length}
                    </p>
                </div>
            </div>
            
            {/* Quick Actions */}
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => navigate('/admin/add-test')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        ➕ Add New Test
                    </button>
                    
                    <button
                        onClick={() => navigate('/admin/add-questions')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        📝 Add Questions
                    </button>
                </div>
            </div>
            
            {/* Recent Users */}
            <div>
                <h2 style={{ marginBottom: '1rem' }}>Recent Users</h2>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Exam</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Role</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.slice(0, 5).map(user => (
                                <tr key={user.id} style={{ borderTop: '1px solid #e0e0e0' }}>
                                    <td style={{ padding: '1rem' }}>{user.name}</td>
                                    <td style={{ padding: '1rem' }}>{user.email}</td>
                                    <td style={{ padding: '1rem' }}>{user.exam_preparation || '-'}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            backgroundColor: user.role === 'admin' ? '#fee' : '#e8f5e9',
                                            color: user.role === 'admin' ? '#c62828' : '#2e7d32',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '3px',
                                            fontSize: '0.875rem'
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;