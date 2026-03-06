import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/Register.css';

const Register = ({ setIsRegistering }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiStatus, setApiStatus] = useState('checking');
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        hasLower: false,
        hasUpper: false,
        hasNumber: false,
        hasSpecial: false,
        minLength: false
    });
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    // Apply theme class to body
    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
    }, [isDarkMode]);

    // Check API health
    useEffect(() => {
        checkApiHealth();
    }, []);

    const checkApiHealth = async () => {
        try {
            await axios.get('http://localhost:5050/api/health', { timeout: 2000 });
            setApiStatus('connected');
        } catch {
            setApiStatus('disconnected');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (name === 'password') {
            checkPasswordStrength(value);
        }
    };

    const checkPasswordStrength = (password) => {
        const strength = {
            hasLower: /[a-z]/.test(password),
            hasUpper: /[A-Z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
            minLength: password.length >= 8
        };
        
        let score = 0;
        if (strength.hasLower) score++;
        if (strength.hasUpper) score++;
        if (strength.hasNumber) score++;
        if (strength.hasSpecial) score++;
        if (strength.minLength) score++;
        
        setPasswordStrength({
            ...strength,
            score: Math.min(4, Math.floor(score / 1.25))
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username) newErrors.username = 'Username required';
        else if (formData.username.length < 3) newErrors.username = 'Min 3 characters';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email) newErrors.email = 'Email required';
        else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email';

        if (!formData.password) newErrors.password = 'Password required';
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const getStrengthInfo = () => {
        const scores = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981', '#10b981'];
        
        return {
            text: scores[passwordStrength.score],
            color: colors[passwordStrength.score],
            width: `${(passwordStrength.score + 1) * 20}%`
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            const response = await axios.post('http://localhost:5050/api/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    setIsRegistering(false);
                }, 3000);
            }
        } catch (err) {
            setErrors({
                submit: err.response?.data?.message || 'Registration failed'
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        document.body.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    };

    if (success) {
        return (
            <div className="register-container">
                <div className="theme-toggle-wrapper">
                    <button onClick={toggleTheme} className="theme-toggle">
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </div>
                <div className="register-card success-card">
                    <div className="success-icon">✅</div>
                    <h2>Registration Successful!</h2>
                    <p>Thank you for registering, <strong>{formData.username}</strong>!</p>
                    <p>Your account is pending admin approval.</p>
                    <p className="redirect-note">Redirecting to login...</p>
                    <button className="login-button" onClick={() => setIsRegistering(false)}>
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    const strengthInfo = getStrengthInfo();

    return (
        <div className="register-container">
            
            
            <div className="register-card">
                <div className="register-header">
                    <h1>🔐 Create Account</h1>
                    <p>Join SecScan to start securing your applications</p>
                </div>

                <div className="api-status" data-status={apiStatus}>
                    {apiStatus === 'connected' && '🟢 API Connected'}
                    {apiStatus === 'disconnected' && '🔴 API Disconnected'}
                    {apiStatus === 'checking' && '🟡 Checking API...'}
                </div>

                {errors.submit && <div className="error-message">{errors.submit}</div>}

                <form onSubmit={handleSubmit} className="horizontal-form">
                    <div className="form-row">
                        <div className="form-column">
                            <div className="input-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Choose username"
                                    className={errors.username ? 'error' : ''}
                                />
                                {errors.username && <span className="field-error">{errors.username}</span>}
                            </div>

                            <div className="input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Your email"
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="field-error">{errors.email}</span>}
                            </div>
                        </div>

                        <div className="form-column">
                            <div className="input-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create password"
                                    className={errors.password ? 'error' : ''}
                                />
                            </div>

                            <div className="input-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    className={errors.confirmPassword ? 'error' : ''}
                                />
                                {errors.confirmPassword && (
                                    <span className="field-error">{errors.confirmPassword}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Password strength - full width below columns */}
                    {formData.password && (
                        <div className="password-section">
                            <div className="password-strength">
                                <div className="strength-bar">
                                    <div 
                                        className="strength-fill"
                                        style={{
                                            width: strengthInfo.width,
                                            backgroundColor: strengthInfo.color
                                        }}
                                    ></div>
                                </div>
                                <span className="strength-text" style={{ color: strengthInfo.color }}>
                                    {strengthInfo.text}
                                </span>
                            </div>

                            <div className="password-requirements">
                                <p className={passwordStrength.minLength ? 'valid' : 'invalid'}>
                                    ✓ At least 8 characters
                                </p>
                                <p className={passwordStrength.hasLower ? 'valid' : 'invalid'}>
                                    ✓ One lowercase letter
                                </p>
                                <p className={passwordStrength.hasUpper ? 'valid' : 'invalid'}>
                                    ✓ One uppercase letter
                                </p>
                                <p className={passwordStrength.hasNumber ? 'valid' : 'invalid'}>
                                    ✓ One number
                                </p>
                                <p className={passwordStrength.hasSpecial ? 'valid' : 'invalid'}>
                                    ✓ One special character
                                </p>
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="register-button">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>
                        Already have an account? 
                        <button onClick={() => setIsRegistering(false)} className="link-button">
                            Login here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;