import React, { useState, useEffect } from 'react';
import '../css/License.css';

const License = ({ onBack }) => {
    const [isDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
    }, [isDarkMode]);

    const socialLinks = [
        {
            name: 'linkedin',
            url: 'https://www.linkedin.com/in/ayoub-rebhi-11b820282/',
            icon: 'fab fa-linkedin',  // ← Font Awesome class
            brandColor: '#0077b5'
        },
        {
            name: 'github',
            url: 'https://github.com/ayoub1108',
            icon: 'fab fa-github',     // ← Font Awesome class
            brandColor: '#333'
        },
        {
            name: 'youtube',
            url: 'https://www.youtube.com/@ayoubrabhi7771',
            icon: 'fab fa-youtube',    // ← Font Awesome class
            brandColor: '#ff0000'
        }
    ];

    return (
        <div className="license-container">
            <div className="license-wrapper">
                <button className="back-button" onClick={onBack}>
                    ← Back
                </button>
                
                <div className="license-card">
                    <img 
                        src="/images/profile.jpeg"
                        alt="Ayoub Rebhi" 
                        className="profile-image"
                    />
                    
                    <div className="card-content">
                        <h2 className="creator-name">Ayoub Rebhi</h2>
                        <h3 className="creator-role">Security Developer & AI Enthusiast</h3>
                        
                        <p className="creator-bio">
                            💻 Software Developer | Cybersecurity Enthusiast | Network Engineer 
                            🎯 Driven to Strengthen Digital Infrastructure & Optimize IT Systems. 
                            Creator of SecScan.
                        </p>
                        
                        <div className="license-info">
                            <div className="license-item">
                                <span className="license-label">License</span>
                                <span className="license-value">MIT</span>
                            </div>
                            <div className="license-item">
                                <span className="license-label">Version</span>
                                <span className="license-value">2.1.0</span>
                            </div>
                            <div className="license-item">
                                <span className="license-label">Built With</span>
                                <span className="license-value">React, Flask, SQLite</span>
                            </div>
                        </div>

                        <div className="socials">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="social-link"
                                    data-brand={social.name}
                                >
                                    <i className={social.icon}></i>  {/* ← Logo here */}
                                    <span className="social-name">{social.name}</span>
                                </a>
                            ))}
                        </div>

                        <p className="copyright">
                            © 2026 Ayoub Rebhi. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default License;