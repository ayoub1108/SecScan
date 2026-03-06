import React, { useState, useEffect } from 'react';
import '../css/GeneralInfo.css';

const GeneralInfo = ({ onBack }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // Your images from the public/images folder
    const images = [
        '/images/cyber-security-logo-icon-symbol-vector-illustration-modern-cyber-security-logo_1123785-4541.avif',
        ,
        '/images/images (1).jpeg',
        '/images/images (2).jpeg',
        '/images/images (3).jpeg',
        '/images/images.jpeg',
        
    ];

    // Auto-slide effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 3000);
        
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className="general-info">
            <div className="info-header">
                <button className="back-btn" onClick={onBack}>←</button>
                <h1 className="main-title">SECSCAN</h1>
                <div className="header-spacer"></div>
            </div>

            <div className="hero-section">
                <div className="hero-text">
                    <h2>THE FUTURE OF<br />CYBERSECURITY</h2>
                    <p>Next-generation security platform powered by artificial intelligence and real-time threat detection.</p>
                </div>
            </div>

            {/* Slideshow */}
            <div className="showcase">
                <div className="showcase-slider">
                    <div 
                        className="slider-track"
                        style={{ 
                            transform: `translateX(-${currentImageIndex * 100}%)`,
                            transition: 'transform 0.5s ease'
                        }}
                    >
                        {images.map((src, index) => (
                            <div key={index} className="slider-item">
                                <img src={src} alt={`slide ${index + 1}`} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="dots">
                    {images.map((_, index) => (
                        <span 
                            key={index}
                            className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(index)}
                        />
                    ))}
                </div>
            </div>

            {/* BIG TEXT SECTION - WHAT WE DO */}
            <div className="big-text-section">
                <h2 className="section-title">WHAT WE DO</h2>
                <div className="big-description">
                    <p className="giant-text">We protect your digital assets with advanced vulnerability scanning and AI-powered threat detection. Our platform analyzes code, scans files, and monitors networks in real-time.</p>
                </div>
            </div>

            {/* FEATURES GRID */}
            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">🛡️</div>
                    <h3>WEB SECURITY</h3>
                    <p>Comprehensive website vulnerability scanning including SQL injection, XSS, CSRF, and more.</p>
                    <div className="feature-stats">
                        <span>500+ sites scanned</span>
                        <span>98% accuracy</span>
                    </div>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">📁</div>
                    <h3>FILE SCANNER</h3>
                    <p>Malware detection using 70+ antivirus engines. Supports executables, documents, and archives.</p>
                    <div className="feature-stats">
                        <span>10K+ files analyzed</span>
                        <span>Zero false positives</span>
                    </div>
                </div>

                <div className="feature-card">
                    <div className="feature-icon">💻</div>
                    <h3>CODE ANALYSIS</h3>
                    <p>AI-powered code review for security vulnerabilities across 15+ programming languages.</p>
                    <div className="feature-stats">
                        <span>1M+ lines analyzed</span>
                        <span>Critical bugs found</span>
                    </div>
                </div>
            </div>

            {/* STATS BANNER */}
            <div className="stats-banner-large">
                <div className="stat-block">
                    <span className="stat-number">10,000+</span>
                    <span className="stat-text">SCANS COMPLETED</span>
                </div>
                <div className="stat-block">
                    <span className="stat-number">99.9%</span>
                    <span className="stat-text">DETECTION RATE</span>
                </div>
                <div className="stat-block">
                    <span className="stat-number">50+</span>
                    <span className="stat-text">COUNTRIES</span>
                </div>
                <div className="stat-block">
                    <span className="stat-number">24/7</span>
                    <span className="stat-text">PROTECTION</span>
                </div>
            </div>

            {/* WHY CHOOSE US */}
            <div className="why-section">
                <h2 className="section-title">WHY SECSCAN</h2>
                <div className="reasons-grid">
                    <div className="reason-item">
                        <h4>01</h4>
                        <p>Enterprise-grade security at zero cost</p>
                    </div>
                    <div className="reason-item">
                        <h4>02</h4>
                        <p>AI-powered threat intelligence</p>
                    </div>
                    <div className="reason-item">
                        <h4>03</h4>
                        <p>Real-time monitoring and alerts</p>
                    </div>
                    <div className="reason-item">
                        <h4>04</h4>
                        <p>Open source and transparent</p>
                    </div>
                </div>
            </div>
            {/* YouTube Video Section */}
{/* YouTube Video Section */}
<div className="video-section">
    <h2 className="video-title">📺 Watch Our Security Tutorials</h2>
    <div className="video-container">
        <iframe 
            src="https://www.youtube.com/embed/CLK5CsCqD7E"
            title="Security Tutorial"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        ></iframe>
    </div>
    <p className="video-caption">Learn more about cybersecurity best practices</p>
</div>
           

            {/* CTA */}
           
        </div>
    );
};

export default GeneralInfo;