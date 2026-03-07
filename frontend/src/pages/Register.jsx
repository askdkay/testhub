import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        exam_preparation: 'SSC'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register, loading } = useAuth();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        const result = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            exam_preparation: formData.exam_preparation
        });
        
        if (result.success) {
            navigate('/tests');
        } else {
            setError(result.message);
        }
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            padding: '20px'
        }}>
            <div style={{ 
                maxWidth: '500px', 
                width: '100%', 
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                    Create Account
                </h2>
                
                {error && (
                    <div style={{ 
                        color: 'red', 
                        textAlign: 'center', 
                        marginBottom: '1rem',
                        padding: '0.5rem',
                        backgroundColor: '#fee',
                        borderRadius: '4px'
                    }}>
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    {/* Name Field */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your full name"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    
                    {/* Email Field */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    
                    {/* Phone Field */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="10 digit mobile number"
                            maxLength="10"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    
                    {/* Exam Preparation Dropdown */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
                            Preparing for *
                        </label>
                        <select
                            name="exam_preparation"
                            value={formData.exam_preparation}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem',
                                backgroundColor: 'white'
                            }}
                        >
                            <option value="SSC">SSC CGL/CHSL</option>
                            <option value="UPSC">UPSC Civil Services</option>
                            <option value="Banking">Banking (IBPS/RRB)</option>
                            <option value="Railway">Railway (RRB NTPC)</option>
                            <option value="Defence">Defence (NDA/CDS)</option>
                            <option value="State PSC">State PSC</option>
                            <option value="Teaching">Teaching (CTET/UPTET)</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    {/* Password Field */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
                            Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Minimum 6 characters"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    
                    {/* Confirm Password Field */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
                            Confirm Password *
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Re-enter password"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    
                    {/* Terms and Conditions */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="checkbox" required />
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>
                                I agree to the Terms and Conditions and Privacy Policy
                            </span>
                        </label>
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
                
                {/* Login Link */}
                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666' }}>
                    Already have an account?{' '}
                    <a href="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
}

export default Register;