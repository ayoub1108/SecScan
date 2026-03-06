import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Home.css';

// Import components
import FileScanner from './FileScanner';
import Settings from './Settings';
import License from './License';
import GeneralInfo from './GeneralInfo';

const Home = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const [activeTab, setActiveTab] = useState('general');
    const [showScanOptions, setShowScanOptions] = useState(false);
    const [scanType, setScanType] = useState(null);

    useEffect(() => {
        const returningFromScan = localStorage.getItem('returningFromScan');
        const lastActiveTab = localStorage.getItem('lastActiveTab');
        const lastScanType = localStorage.getItem('lastScanType');
        
        if (returningFromScan === 'true') {
            if (lastActiveTab) setActiveTab(lastActiveTab);
            if (lastScanType) setScanType(lastScanType);
            
            localStorage.removeItem('returningFromScan');
            localStorage.removeItem('lastActiveTab');
            localStorage.removeItem('lastScanType');
            
            console.log('Welcome back!');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('token');
        localStorage.removeItem('loginTime');
        setIsAuthenticated(false);
        navigate('/login');
    };

    const handleExternalRedirect = (url, scannerName) => {
        localStorage.setItem('returningFromScan', 'true');
        localStorage.setItem('lastActiveTab', activeTab);
        localStorage.setItem('lastScanType', scanType || 'none');
        localStorage.setItem('lastScanner', scannerName);
        window.location.href = url;
    };

    const handleFileScannerBack = () => {
        console.log('Returning from FileScanner');
        setScanType(null);
        localStorage.setItem('returningFromScan', 'true');
        localStorage.setItem('lastActiveTab', activeTab);
    };

    const renderContent = () => {
        if (scanType === 'file') {
            return <FileScanner onBack={handleFileScannerBack} />;
        }

        switch(activeTab) {
            case 'general':
                return <GeneralInfo onBack={() => setActiveTab('scan')} />;
            
            case 'scan':
                return (
                    <div className="scan-content">
                        <div className="content-header">
                            <h1>Security Scanner</h1>
                            <p>Choose your scan type to begin</p>
                        </div>

                        <div className="quick-start-container">
                            <button 
                                className="quick-start-btn"
                                onClick={() => setShowScanOptions(!showScanOptions)}
                            >
                                {showScanOptions ? '✕ Close' : '🚀 Quick Start'}
                            </button>
                        </div>

                        {showScanOptions && (
                            <div className="scan-options-overlay">
                                <div className="scan-options-popup">
                                    <h2>Select Scan Type</h2>
                                    <p>Choose what you want to scan</p>
                                    
                                    <div className="scan-options-grid">
                                        <button 
                                            className="scan-option-btn web-scan"
                                            onClick={() => {
                                                handleExternalRedirect('http://localhost:5000', 'Web Security');
                                                setShowScanOptions(false);
                                            }}
                                        >
                                            <span className="option-icon">🌐</span>
                                            <span className="option-title">Web Security</span>
                                            <span className="option-desc">Scan websites for vulnerabilities</span>
                                        </button>

                                        <button 
                                            className="scan-option-btn file-scan"
                                            onClick={() => {
                                                setScanType('file');
                                                setShowScanOptions(false);
                                            }}
                                        >
                                            <span className="option-icon">📁</span>
                                            <span className="option-title">File Scanner</span>
                                            <span className="option-desc">Analyze files with 70+ antivirus engines</span>
                                        </button>

                                        <button 
                                            className="scan-option-btn code-scan"
                                            onClick={() => {
                                                handleExternalRedirect('http://localhost:8080', 'AI Code Scanner');
                                                setShowScanOptions(false);
                                            }}
                                        >
                                            <span className="option-icon">💻</span>
                                            <span className="option-title">AI Code Scanner</span>
                                            <span className="option-desc">AI-powered code security analysis</span>
                                        </button>
                                    </div>

                                    <button 
                                        className="close-popup-btn"
                                        onClick={() => setShowScanOptions(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            
            case 'license':
                return <License onBack={() => setActiveTab('scan')} />;
            
            case 'settings':
                return <Settings onBack={() => setActiveTab('scan')} />;
            
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="home-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>SecScan</h2>
                </div>
                
                <nav className="sidebar-nav">
                    <button 
                        className={`nav-item ${activeTab === 'general' && !scanType ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('general');
                            setScanType(null);
                            setShowScanOptions(false);
                        }}
                        data-label="General Info"
                    >
                        <span className="nav-icon">📋</span>
                        <span className="nav-label">General Info</span>
                    </button>
                    
                    <button 
                        className={`nav-item ${activeTab === 'scan' && !scanType ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('scan');
                            setScanType(null);
                            setShowScanOptions(false);
                        }}
                        data-label="Scan"
                    >
                        <span className="nav-icon">🔍</span>
                        <span className="nav-label">Scan</span>
                    </button>
                    
                    <button 
                        className={`nav-item ${activeTab === 'license' && !scanType ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('license');
                            setScanType(null);
                            setShowScanOptions(false);
                        }}
                        data-label="License"
                    >
                        <span className="nav-icon">📜</span>
                        <span className="nav-label">License</span>
                    </button>
                    
                    <button 
                        className={`nav-item ${activeTab === 'settings' && !scanType ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('settings');
                            setScanType(null);
                            setShowScanOptions(false);
                        }}
                        data-label="Settings"
                    >
                        <span className="nav-icon">⚙️</span>
                        <span className="nav-label">Settings</span>
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <span className="user-avatar">👤 </span>
                        <span className="user-name">{username}</span>
                    </div>
                    <button onClick={handleLogout} className="logout-btn-sidebar">
                        <span className="nav-icon">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            <div className="main-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default Home;