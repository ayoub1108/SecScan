import React, { useState, useEffect } from 'react';
import '../css/CodeScanner.css';

const CodeScanner = ({ onBack }) => {
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [scanning, setScanning] = useState(false);
    const [findings, setFindings] = useState([]);
    const [error, setError] = useState('');
    const [semgrepReady, setSemgrepReady] = useState(false);

    // Check if Semgrep API is available
    useEffect(() => {
        checkSemgrepStatus();
    }, []);

    const checkSemgrepStatus = async () => {
        try {
            const response = await fetch('http://localhost:5002/api/check-semgrep');
            const data = await response.json();
            setSemgrepReady(data.installed);
        } catch (err) {
            console.error('Failed to check Semgrep:', err);
            setSemgrepReady(false);
        }
    };

    const handleScan = async () => {
        if (!code.trim()) {
            setError('Please enter code to scan');
            return;
        }

        setScanning(true);
        setError('');
        setFindings([]);

        try {
            const response = await fetch('http://localhost:5002/api/scan-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    language: language
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Scan failed');
            }

            setFindings(data.findings || []);

        } catch (err) {
            console.error('Scan error:', err);
            setError(err.message || 'Failed to scan code');
        } finally {
            setScanning(false);
        }
    };

    const clearAll = () => {
        setCode('');
        setFindings([]);
        setError('');
    };

    // Calculate stats
    const stats = {
        total: findings.length,
        critical: findings.filter(f => f.severity === 'CRITICAL').length,
        high: findings.filter(f => f.severity === 'HIGH').length,
        medium: findings.filter(f => f.severity === 'MEDIUM').length,
        low: findings.filter(f => f.severity === 'LOW').length
    };

    return (
        <div className="code-scanner">
            <div className="scanner-header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h1>🔍 Semgrep Code Scanner</h1>
                {semgrepReady ? (
                    <span className="status-badge ready">✅ Semgrep Ready</span>
                ) : (
                    <span className="status-badge error" onClick={checkSemgrepStatus}>
                        ⚠️ Semgrep Not Found - Click to Retry
                    </span>
                )}
            </div>

            <div className="scanner-main">
                {/* Input Panel */}
                <div className="input-panel">
                    <h2>Input</h2>
                    
                    <div className="form-group">
                        <label>Programming Language</label>
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                            className="language-select"
                        >
                            <option value="python">Python</option>
                            <option value="javascript">JavaScript</option>
                            <option value="java">Java</option>
                            <option value="php">PHP</option>
                            <option value="ruby">Ruby</option>
                            <option value="go">Go</option>
                            <option value="csharp">C#</option>
                            <option value="cpp">C++</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Code to Scan</label>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Paste your code here..."
                            rows={20}
                            className="code-input"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="button-group">
                        <button 
                            className="scan-btn"
                            onClick={handleScan}
                            disabled={scanning || !semgrepReady}
                        >
                            {scanning ? 'Scanning...' : 'Scan Code with Semgrep'}
                        </button>
                        {code && (
                            <button className="clear-btn" onClick={clearAll}>
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Output Panel */}
                <div className="output-panel">
                    <h2>Findings ({stats.total})</h2>
                    
                    {scanning ? (
                        <div className="scanning">
                            <div className="spinner"></div>
                            <p>Running static analysis...</p>
                        </div>
                    ) : findings.length > 0 ? (
                        <div className="findings-container">
                            {/* Summary Stats */}
                            <div className="stats-summary">
                                <div className="stat-item">
                                    <span className="stat-value">{stats.critical}</span>
                                    <span className="stat-label">Critical</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{stats.high}</span>
                                    <span className="stat-label">High</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{stats.medium}</span>
                                    <span className="stat-label">Medium</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-value">{stats.low}</span>
                                    <span className="stat-label">Low</span>
                                </div>
                            </div>

                            {/* Findings List */}
                            <div className="findings-list">
                                {findings.map((finding, index) => (
                                    <div key={index} className={`finding-card ${finding.severity.toLowerCase()}`}>
                                        <div className="finding-header">
                                            <span className={`severity-badge ${finding.severity.toLowerCase()}`}>
                                                {finding.severity}
                                            </span>
                                            <span className="finding-type">{finding.type}</span>
                                            {finding.line > 0 && (
                                                <span className="finding-line">Line {finding.line}</span>
                                            )}
                                        </div>
                                        <p className="finding-message">{finding.message}</p>
                                        <div className="finding-metadata">
                                            {finding.cwe !== 'N/A' && (
                                                <span className="finding-cwe">CWE: {finding.cwe}</span>
                                            )}
                                            <span className="finding-confidence">
                                                Confidence: {finding.confidence}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="placeholder">
                            <p>Findings will appear here</p>
                            <small>Click Scan Code to analyze with Semgrep</small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CodeScanner;