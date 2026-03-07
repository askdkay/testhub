import { Link } from 'react-router-dom';

function Home() {
    return (
        <div>
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '5rem 2rem',
                textAlign: 'center'
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    India's Best Test Series Platform
                </h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
                    Prepare for UPSC, SSC, Banking, Railway & more
                </p>
                <Link to="/tests">
                    <button style={{
                        padding: '1rem 2rem',
                        fontSize: '1.1rem',
                        backgroundColor: 'white',
                        color: '#764ba2',
                        border: 'none',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}>
                        Explore Tests
                    </button>
                </Link>
            </div>

            {/* Features Section */}
            <div style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem' }}>
                    Why Choose Us?
                </h2>
                
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem'
                }}>
                    {[
                        { title: '100+ Test Series', desc: 'Covering all competitive exams' },
                        { title: 'Detailed Analysis', desc: 'Get in-depth performance reports' },
                        { title: 'All India Rank', desc: 'Compare with thousands of students' },
                        { title: 'Expert Solutions', desc: 'Video solutions for every question' }
                    ].map((feature, index) => (
                        <div key={index} style={{
                            padding: '2rem',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '10px',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ marginBottom: '1rem', color: '#333' }}>{feature.title}</h3>
                            <p style={{ color: '#666' }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;