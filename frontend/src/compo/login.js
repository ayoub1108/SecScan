import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/login.css';

const Login = ({ setIsAuthenticated, setIsRegistering }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });
    const [imageLoaded, setImageLoaded] = useState(false);

    // Apply theme to body
    useEffect(() => {
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Preload image to check if it exists
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            console.log('✅ Image loaded successfully');
            setImageLoaded(true);
        };
        img.onerror = () => {
            console.log('❌ Image failed to load, using fallback');
            setImageLoaded(false);
        };
        img.src = '/images/cyber-security-logo-icon-symbol-vector-illustration-modern-cyber-security-logo_1123785-4541.avif';
    }, []);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:5050/api/login', formData);
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', response.data.username);
                localStorage.setItem('role', response.data.role || 'user');
                localStorage.setItem('loginTime', Date.now().toString());
                
                setIsAuthenticated(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    // Define background styles based on theme
    const getBackgroundStyle = () => {
        if (isDarkMode && imageLoaded) {
            return {
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/images/cyber-security-logo-icon-symbol-vector-illustration-modern-cyber-security-logo_1123785-4541.avif')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            };
        } else if (isDarkMode) {
            // Fallback dark mode gradient if image fails
            return {
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
            };
        } else {
            // Light mode gradient
            return {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            };
        }
    };

    return (
        <div className="cybersec-container" style={getBackgroundStyle()}>
            
            
            <div className="cybersec-card">
                <div className="cybersec-logo">
                    <span className="logo-shield">🛡️</span>
                    <span className="logo-text">Security_Scanner</span>
                </div>
                
                <h1 className="cybersec-title">Login</h1>
                
                {error && <div className="cybersec-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="cybersec-input-group">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="cybersec-input-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className="cybersec-forgot">
                        <a href="#">Forgot password?</a>
                    </div>
                    
                    <button type="submit" disabled={loading} className="cybersec-button">
                        {loading ? 'LOGGING IN...' : 'LOGIN'}
                    </button>
                </form>
                
                <div className="cybersec-register">
                    <p>Don't have an account?</p>
                    <button onClick={() => setIsRegistering(true)} className="cybersec-link">
                        Register here
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;