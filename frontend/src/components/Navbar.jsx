import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav style={{
            backgroundColor: 'white',
            padding: '1rem 2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#764ba2' }}>
                TestSeries
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Link to="/" style={{ color: '#666' }}>Home</Link>
                <Link to="/tests" style={{ color: '#666' }}>Tests</Link>
                
                {/* 🔥 ADMIN LINK - Sirf admin ko dikhega */}
                {user && user.role === 'admin' && (
                    <Link 
                        to="/admin" 
                        style={{ 
                            color: '#2563eb', 
                            fontWeight: 'bold',
                            backgroundColor: '#e0e7ff',
                            padding: '0.5rem 1rem',
                            borderRadius: '5px'
                        }}
                    >
                        Admin Panel
                    </Link>
                )}
                
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#666' }}>
                            Hi, {user.name} 
                            {user.role === 'admin' && ' (Admin)'}
                        </span>
                        <button 
                            onClick={handleLogout}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <Link to="/login" style={{ color: '#666' }}>Login</Link>
                        <Link to="/register" style={{ color: '#666' }}>Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;