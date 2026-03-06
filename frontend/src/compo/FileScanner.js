import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import '../css/FileScanner.css';

const FileScanner = ({ onBack }) => {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [recentScans, setRecentScans] = useState([]);
    const [showApiSetup, setShowApiSetup] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [apiKey, setApiKey] = useState('');

    // Load API key and recent scans from localStorage on component mount
    useEffect(() => {
        console.log('✅ FileScanner mounted');
        
        // Load API key
        const savedApiKey = localStorage.getItem('virustotal_api_key');
        if (savedApiKey) {
            setApiKey(savedApiKey);
        } else {
            const envApiKey = process.env.REACT_APP_VIRUSTOTAL_API_KEY;
            if (envApiKey) {
                setApiKey(envApiKey);
                localStorage.setItem('virustotal_api_key', envApiKey);
            } else {
                setShowApiSetup(true);
            }
        }

        // Load recent scans from localStorage
        const savedScans = localStorage.getItem('recent_file_scans');
        if (savedScans) {
            try {
                setRecentScans(JSON.parse(savedScans));
            } catch (e) {
                console.error('Failed to parse saved scans:', e);
            }
        }

        return () => {
            console.log('🔄 FileScanner unmounting - this is normal');
        };
    }, []); // Fixed: Added closing bracket and parenthesis

    // Save recent scans to localStorage whenever they change
    useEffect(() => {
        if (recentScans.length > 0) {
            localStorage.setItem('recent_file_scans', JSON.stringify(recentScans));
        }
    }, [recentScans]);

    // Handle back button click
    const handleBackClick = () => {
        console.log('👆 Back button clicked');
        console.log('Calling onBack function:', onBack);
        onBack();
    };

    // Handle drag events
    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    // Handle drop event
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    // Handle file selection
    const handleFile = (selectedFile) => {
        if (selectedFile.size > 32 * 1024 * 1024) {
            setError('File too large. Max size: 32MB');
            return;
        }
        setFile(selectedFile);
        setError('');
        setResults(null);
    };

    // Handle file input change
    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    // Save API key
    const saveApiKey = () => {
        if (!apiKeyInput.trim()) {
            setError('Please enter a valid API key');
            return;
        }

        if (apiKeyInput.length < 30) {
            setError('API key seems too short. Please check and try again.');
            return;
        }

        localStorage.setItem('virustotal_api_key', apiKeyInput);
        setApiKey(apiKeyInput);
        setShowApiSetup(false);
        setApiKeyInput('');
        setError('');
    };

    // Clear API key
    const clearApiKey = () => {
        localStorage.removeItem('virustotal_api_key');
        setApiKey('');
        setShowApiSetup(true);
    };

    // Clear all scan history
    const clearHistory = () => {
        setRecentScans([]);
        localStorage.removeItem('recent_file_scans');
    };

    // Remove a single scan from history
    const removeFromHistory = (indexToRemove, e) => {
        e.stopPropagation(); // Prevent triggering the parent onClick
        const updatedScans = recentScans.filter((_, index) => index !== indexToRemove);
        setRecentScans(updatedScans);
        if (updatedScans.length === 0) {
            localStorage.removeItem('recent_file_scans');
        }
    };

    // Scan file with VirusTotal API
    const scanFile = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        if (!apiKey) {
            setShowApiSetup(true);
            return;
        }

        setScanning(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Uploading file to VirusTotal...');
            
            const uploadResponse = await axios.post(
                'https://www.virustotal.com/api/v3/files',
                formData,
                {
                    headers: {
                        'x-apikey': apiKey,
                        'Content-Type': 'multipart/form-data'
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
            );

            console.log('Upload successful, getting analysis ID...');
            const analysisId = uploadResponse.data.data.id;
            
            // Poll for results
            let analysisComplete = false;
            let attempts = 0;
            const maxAttempts = 15;
            
            while (!analysisComplete && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                console.log(`Polling for results... Attempt ${attempts + 1}`);
                
                const reportResponse = await axios.get(
                    `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
                    {
                        headers: { 'x-apikey': apiKey }
                    }
                );
                
                if (reportResponse.data.data.attributes.status === 'completed') {
                    console.log('Analysis complete!');
                    
                    const stats = reportResponse.data.data.attributes.stats;
                    const fileInfo = reportResponse.data.meta?.file_info || {
                        sha256: analysisId.split('-')[0]
                    };
                    
                    const engineResults = [];
                    if (reportResponse.data.data.attributes.results) {
                        const results = reportResponse.data.data.attributes.results;
                        Object.keys(results).slice(0, 20).forEach((engineName) => {
                            const result = results[engineName];
                            engineResults.push({
                                name: engineName,
                                category: result.category,
                                result: result.result || '-'
                            });
                        });
                    }
                    
                    const scanResults = {
                        sha256: fileInfo.sha256 || 'N/A',
                        stats: {
                            total: stats.harmless + stats.malicious + stats.suspicious + stats.undetected,
                            malicious: stats.malicious || 0,
                            suspicious: stats.suspicious || 0,
                            harmless: stats.harmless || 0,
                            undetected: stats.undetected || 0
                        },
                        engines: engineResults,
                        fileName: file.name,
                        scanDate: new Date().toISOString()
                    };
                    
                    setResults(scanResults);
                    
                    // Add to recent scans (avoid duplicates)
                    setRecentScans(prev => {
                        // Check if this file hash already exists
                        const exists = prev.some(scan => scan.hash === scanResults.sha256);
                        if (exists) return prev;
                        
                        const newScans = [{
                            name: file.name,
                            hash: scanResults.sha256,
                            date: new Date().toLocaleString(),
                            malicious: scanResults.stats.malicious,
                            total: scanResults.stats.total
                        }, ...prev].slice(0, 10); // Keep last 10 scans
                        
                        return newScans;
                    });
                    
                    setScanning(false);
                    return;
                }
                attempts++;
            }
            
            setError('Scan timed out. Please try again.');
        } catch (err) {
            console.error('VirusTotal API error:', err);
            
            if (err.response?.status === 401) {
                setError('Invalid API key. Please check your VirusTotal API key.');
                setShowApiSetup(true);
            } else if (err.response?.status === 429) {
                setError('Rate limit exceeded. Free tier allows 4 scans per minute. Please wait.');
            } else if (err.response?.status === 413) {
                setError('File too large for VirusTotal free tier (max 32MB).');
            } else {
                setError(err.response?.data?.error?.message || 'Scan failed. Please try again.');
            }
        } finally {
            setScanning(false);
        }
    };

    // Check file hash
    const checkHash = async (hash) => {
        if (!apiKey) {
            setShowApiSetup(true);
            return;
        }

        setScanning(true);
        setError('');

        try {
            const response = await axios.get(
                `https://www.virustotal.com/api/v3/files/${hash}`,
                {
                    headers: { 'x-apikey': apiKey }
                }
            );

            const data = response.data.data;
            const stats = data.attributes.last_analysis_stats;
            
            // Find the scan in recent scans to get the filename
            const existingScan = recentScans.find(scan => scan.hash === hash);
            
            const scanResults = {
                sha256: hash,
                stats: {
                    total: stats.harmless + stats.malicious + stats.suspicious + stats.undetected,
                    malicious: stats.malicious || 0,
                    suspicious: stats.suspicious || 0,
                    harmless: stats.harmless || 0,
                    undetected: stats.undetected || 0
                },
                engines: [],
                fileName: existingScan?.name || 'Unknown file',
                scanDate: new Date().toISOString()
            };
            
            setResults(scanResults);
        } catch (err) {
            setError('Hash not found in VirusTotal database');
        } finally {
            setScanning(false);
        }
    };

    // API Key Setup Component
    const ApiKeySetup = () => (
        <div className="api-setup-overlay">
            <div className="api-setup-popup">
                <h2>🔑 VirusTotal API Key Setup</h2>
                
                <div className="api-setup-content">
                    <div className="api-instructions">
                        <h3>Get your free API key in 3 simple steps:</h3>
                        
                        <ol>
                            <li>
                                <strong>Go to VirusTotal</strong>
                                <p>Visit <a href="https://www.virustotal.com/gui/join-us" target="_blank" rel="noopener noreferrer">virustotal.com/gui/join-us</a></p>
                            </li>
                            <li>
                                <strong>Create a free account</strong>
                                <p>Sign up using email, Google, or GitHub</p>
                            </li>
                            <li>
                                <strong>Get your API key</strong>
                                <p>After login, click on your username → API Key</p>
                            </li>
                        </ol>
                        
                        <div className="api-example">
                            <p>Your API key looks like this:</p>
                            <code>0b5f8e9a2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0</code>
                        </div>
                    </div>
                    
                    <div className="api-input-section">
                        <h3>Paste your API key here:</h3>
                        <input
                            type="text"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="Paste your VirusTotal API key..."
                            className="api-key-input"
                        />
                        
                        <div className="api-buttons">
                            <button onClick={saveApiKey} className="save-api-btn">
                                ✅ Save API Key
                            </button>
                            <button onClick={() => setShowApiSetup(false)} className="cancel-api-btn">
                                ✕ Cancel
                            </button>
                        </div>
                        
                        <p className="api-note">
                            ⚡ Your API key is stored locally in your browser and never sent to our servers.
                            <br />
                            🔒 Free tier: 500 scans/day, 4 scans/minute, max 32MB per file.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="file-scanner">
            {/* Header with back button and API status */}
            <div className="scanner-header">
                <div className="header-left">
                    <button className="back-btn" onClick={handleBackClick}>
                        ← Back
                    </button>
                </div>
                <div className="header-center">
                    <h1>🔬 VirusTotal File Scanner</h1>
                    <p>Drag & drop or browse to scan files with 70+ antivirus engines</p>
                </div>
                <div className="header-right">
                    {apiKey ? (
                        <div className="api-status-badge configured" onClick={clearApiKey} title="Click to change API key">
                            ✅ API Key Configured
                        </div>
                    ) : (
                        <div className="api-status-badge missing" onClick={() => setShowApiSetup(true)}>
                            ⚠️ API Key Missing - Click to setup
                        </div>
                    )}
                </div>
            </div>

            {/* Main Scanner Interface - rest of your JSX remains the same */}
            <div className="scanner-interface">
                {/* Upload Area */}
                {apiKey ? (
                    <>
                        <div 
                            className={`upload-area ${dragActive ? 'dragover' : ''} ${file ? 'has-file' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('fileInput').click()}
                        >
                            <input
                                type="file"
                                id="fileInput"
                                onChange={handleFileInput}
                                style={{ display: 'none' }}
                            />
                            
                            {!file ? (
                                <>
                                    <div className="upload-icon">📁</div>
                                    <h2>Drag and drop your file here</h2>
                                    <p>or <span className="browse-link">browse</span> to choose a file</p>
                                    <p className="file-limit">Max file size: 32MB (VirusTotal free tier)</p>
                                </>
                            ) : (
                                <div className="file-preview">
                                    <div className="file-icon">📄</div>
                                    <div className="file-details">
                                        <h3>{file.name}</h3>
                                        <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button 
                                        className="change-file-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                            setResults(null);
                                        }}
                                    >
                                        Change
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Scan Button */}
                        {file && !results && (
                            <button 
                                className={`scan-btn ${scanning ? 'scanning' : ''}`}
                                onClick={scanFile}
                                disabled={scanning}
                            >
                                {scanning ? '🔍 Scanning with 70+ engines...' : '🔬 Scan File with VirusTotal'}
                            </button>
                        )}
                    </>
                ) : (
                    <div className="api-required-message">
                        <div className="api-icon">🔑</div>
                        <h2>API Key Required</h2>
                        <p>You need a VirusTotal API key to scan files.</p>
                        <button className="setup-api-btn" onClick={() => setShowApiSetup(true)}>
                            Setup API Key Now
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {error && <div className="error-message">{error}</div>}

                {/* Results Section */}
                {results && (
                    <div className="results-section">
                        <div className="results-header">
                            <h2>Scan Results: {results.fileName}</h2>
                            <div className="file-hash">
                                <span>SHA-256:</span>
                                <code>{results.sha256}</code>
                                <button 
                                    className="copy-btn"
                                    onClick={() => navigator.clipboard.writeText(results.sha256)}
                                    title="Copy hash"
                                >
                                    📋
                                </button>
                            </div>
                            <div className="scan-date">
                                Scanned on: {new Date(results.scanDate).toLocaleString()}
                            </div>
                        </div>

                        {/* Detection Stats */}
                        <div className="detection-summary">
                            <div className={`detection-ratio ${results.stats.malicious > 0 ? 'malicious' : 'safe'}`}>
                                <span className="ratio-number">
                                    {results.stats.malicious}/{results.stats.total}
                                </span>
                                <span className="ratio-label">security vendors detected</span>
                            </div>
                            
                            <div className="stats-grid">
                                <div className="stat-item malicious">
                                    <span className="stat-value">{results.stats.malicious}</span>
                                    <span className="stat-label">Malicious</span>
                                </div>
                                <div className="stat-item suspicious">
                                    <span className="stat-value">{results.stats.suspicious}</span>
                                    <span className="stat-label">Suspicious</span>
                                </div>
                                <div className="stat-item harmless">
                                    <span className="stat-value">{results.stats.harmless}</span>
                                    <span className="stat-label">Harmless</span>
                                </div>
                                <div className="stat-item undetected">
                                    <span className="stat-value">{results.stats.undetected}</span>
                                    <span className="stat-label">Undetected</span>
                                </div>
                            </div>
                        </div>

                        {/* Engine Results Table */}
                        {results.engines.length > 0 && (
                            <div className="engine-results">
                                <h3>Detection Engines (Sample)</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Engine</th>
                                            <th>Category</th>
                                            <th>Result</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.engines.slice(0, 10).map((engine, index) => (
                                            <tr key={index}>
                                                <td className="engine-name">{engine.name}</td>
                                                <td>
                                                    <span className={`category-badge ${engine.category}`}>
                                                        {engine.category}
                                                    </span>
                                                </td>
                                                <td className="engine-result">{engine.result || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="table-note">
                                    Showing 10 of {results.engines.length} engines
                                </p>
                            </div>
                        )}

                        {/* New Scan Button */}
                        <button 
                            className="new-scan-btn"
                            onClick={() => {
                                setFile(null);
                                setResults(null);
                            }}
                        >
                            Scan Another File
                        </button>
                    </div>
                )}

                {/* Recent Scans */}
                {recentScans.length > 0 && !results && !file && apiKey && (
                    <div className="recent-scans">
                        <div className="recent-scans-header">
                            <h3>📋 Recent Scans (Persistent)</h3>
                            <button className="clear-history-btn" onClick={clearHistory} title="Clear all history">
                                🗑️ Clear All
                            </button>
                        </div>
                        <div className="scan-history">
                            {recentScans.map((scan, index) => (
                                <div 
                                    key={index} 
                                    className="history-item"
                                    onClick={() => checkHash(scan.hash)}
                                >
                                    <span className="history-icon">📄</span>
                                    <div className="history-details">
                                        <span className="history-name">{scan.name}</span>
                                        <span className="history-date">{scan.date}</span>
                                    </div>
                                    <div className="history-stats">
                                        <span className={`history-status ${scan.malicious > 0 ? 'malicious' : 'safe'}`}>
                                            {scan.malicious > 0 ? `⚠️ ${scan.malicious}/${scan.total}` : '✅ Safe'}
                                        </span>
                                        <button 
                                            className="history-remove"
                                            onClick={(e) => removeFromHistory(index, e)}
                                            title="Remove from history"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="history-note">
                            💾 History is saved in your browser and persists even after restarting
                        </p>
                    </div>
                )}
            </div>

            {/* API Key Setup Popup */}
            {showApiSetup && <ApiKeySetup />}
        </div>
    );
};

export default FileScanner;