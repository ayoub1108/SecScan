import React, { useState, useEffect } from 'react';
import '../css/Settings.css';

const Settings = ({ onBack }) => {
    const [activeSection, setActiveSection] = useState('profile');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    
    // User profile state
    const [profile, setProfile] = useState({
        name: localStorage.getItem('username') || 'John Doe',
        email: 'user@example.com',
        company: 'SecScan Inc.',
        role: 'Security Analyst',
        avatar: '👤'
    });

    // Notification settings
    const [notifications, setNotifications] = useState({
        email: {
            enabled: true,
            scanComplete: true,
            criticalFindings: true,
            weeklyReport: false,
            marketing: false
        },
        desktop: {
            enabled: true,
            scanComplete: true,
            criticalFindings: true
        },
        slack: {
            enabled: false,
            webhook: '',
            sendCritical: true
        }
    });

    // Appearance settings
    const [appearance, setAppearance] = useState({
        theme: localStorage.getItem('theme') || 'dark',
        accentColor: 'blue',
        sidebarBehavior: 'expanded',
        animations: true,
        fontSize: 'medium',
        compactMode: false,
        blurEffects: true
    });

    // API Keys
    const [apiKeys, setApiKeys] = useState({
        virustotal: {
            key: localStorage.getItem('virustotal_api_key') || '',
            showKey: false,
            status: localStorage.getItem('virustotal_api_key') ? 'configured' : 'missing'
        },
        deepseek: {
            key: localStorage.getItem('deepseek_api_key') || '',
            showKey: false,
            status: localStorage.getItem('deepseek_api_key') ? 'configured' : 'missing'
        }
    });

    // Data management
    const [dataSettings, setDataSettings] = useState({
        retentionDays: 90,
        autoDelete: false,
        shareAnalytics: true,
        scanHistory: 156
    });

    // Security settings
    const [security, setSecurity] = useState({
        twoFactorEnabled: false,
        sessionTimeout: 30,
        loginNotifications: true,
        lastLogin: '2026-03-01 08:45 AM',
        lastLoginIP: '192.168.1.105'
    });

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setAppearance(prev => ({ ...prev, theme: savedTheme }));
            document.body.setAttribute('data-theme', savedTheme);
        }
        
        const vtKey = localStorage.getItem('virustotal_api_key');
        const dsKey = localStorage.getItem('deepseek_api_key');
        
        setApiKeys({
            virustotal: {
                key: vtKey || '',
                showKey: false,
                status: vtKey ? 'configured' : 'missing'
            },
            deepseek: {
                key: dsKey || '',
                showKey: false,
                status: dsKey ? 'configured' : 'missing'
            }
        });
    }, []);

    const saveSettings = () => {
        // Save theme
        localStorage.setItem('theme', appearance.theme);
        
        // Apply theme based on selection
        if (appearance.theme === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
        } else {
            document.body.setAttribute('data-theme', appearance.theme);
        }
        
        // Save font size
        localStorage.setItem('fontSize', appearance.fontSize);
        document.body.setAttribute('data-font-size', appearance.fontSize);
        
        // Save accent color
        localStorage.setItem('accentColor', appearance.accentColor);
        
        // Save API keys
        if (apiKeys.virustotal.key) {
            localStorage.setItem('virustotal_api_key', apiKeys.virustotal.key);
        }
        if (apiKeys.deepseek.key) {
            localStorage.setItem('deepseek_api_key', apiKeys.deepseek.key);
        }
        
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 3000);
    };

    // Handle profile update
    const updateProfile = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    // Toggle API key visibility
    const toggleKeyVisibility = (service) => {
        setApiKeys(prev => ({
            ...prev,
            [service]: { ...prev[service], showKey: !prev[service].showKey }
        }));
    };

    // Update API key
    const updateApiKey = (service, value) => {
        setApiKeys(prev => ({
            ...prev,
            [service]: { 
                ...prev[service], 
                key: value,
                status: value ? 'configured' : 'missing'
            }
        }));
    };

    // Handle data export
    const exportData = () => {
        const data = {
            profile,
            settings: { notifications, appearance, apiKeys, dataSettings, security },
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `secscan-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    // Handle account deletion
    const deleteAccount = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    // Theme toggle function
    const toggleTheme = () => {
        const newTheme = appearance.theme === 'dark' ? 'light' : 'dark';
        setAppearance({...appearance, theme: newTheme});
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const renderSection = () => {
        switch(activeSection) {
            case 'profile':
                return (
                    <div className="settings-section">
                        <div className="section-header">
                            <h2>👤 Profile Settings</h2>
                            <p className="section-description">Manage your personal information and account details</p>
                        </div>
                        
                        <div className="settings-card">
                            <div className="profile-header">
                                <div className="avatar-large">
                                    <span>{profile.avatar}</span>
                                </div>
                                <div className="profile-info">
                                    <h3>{profile.name}</h3>
                                    <p>{profile.role}</p>
                                    <button className="button-secondary">Change Avatar</button>
                                </div>
                            </div>
                            
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Display Name</label>
                                    <input 
                                        type="text" 
                                        value={profile.name}
                                        onChange={(e) => updateProfile('name', e.target.value)}
                                        placeholder="Enter your name"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input 
                                        type="email" 
                                        value={profile.email}
                                        onChange={(e) => updateProfile('email', e.target.value)}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Company/Organization</label>
                                    <input 
                                        type="text" 
                                        value={profile.company}
                                        onChange={(e) => updateProfile('company', e.target.value)}
                                        placeholder="Enter company name"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Role</label>
                                    <input 
                                        type="text" 
                                        value={profile.role}
                                        onChange={(e) => updateProfile('role', e.target.value)}
                                        placeholder="Enter your role"
                                    />
                                </div>
                            </div>
                            
                            <button className="button-warning" onClick={() => setShowPasswordModal(true)}>
                                🔑 Change Password
                            </button>
                        </div>
                    </div>
                );
                
            case 'notifications':
                return (
                    <div className="settings-section">
                        <div className="section-header">
                            <h2>🔔 Notification Preferences</h2>
                            <p className="section-description">Control how and when you receive notifications</p>
                        </div>
                        
                        <div className="settings-card">
                            <h3>Email Notifications</h3>
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-title">Enable Email Notifications</span>
                                    <span className="toggle-description">Receive updates via email</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={notifications.email.enabled}
                                        onChange={(e) => setNotifications({
                                            ...notifications,
                                            email: { ...notifications.email, enabled: e.target.checked }
                                        })}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            
                            {notifications.email.enabled && (
                                <>
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-title">Scan Complete</span>
                                            <span className="toggle-description">Get notified when scans finish</span>
                                        </div>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.email.scanComplete}
                                                onChange={(e) => setNotifications({
                                                    ...notifications,
                                                    email: { ...notifications.email, scanComplete: e.target.checked }
                                                })}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-title">Critical Findings</span>
                                            <span className="toggle-description">Immediate alerts for critical vulnerabilities</span>
                                        </div>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.email.criticalFindings}
                                                onChange={(e) => setNotifications({
                                                    ...notifications,
                                                    email: { ...notifications.email, criticalFindings: e.target.checked }
                                                })}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-title">Weekly Summary Report</span>
                                            <span className="toggle-description">Get a weekly digest of all activities</span>
                                        </div>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.email.weeklyReport}
                                                onChange={(e) => setNotifications({
                                                    ...notifications,
                                                    email: { ...notifications.email, weeklyReport: e.target.checked }
                                                })}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="settings-card">
                            <h3>Desktop Notifications</h3>
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-title">Enable Desktop Notifications</span>
                                    <span className="toggle-description">Show notifications in your browser</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={notifications.desktop.enabled}
                                        onChange={(e) => setNotifications({
                                            ...notifications,
                                            desktop: { ...notifications.desktop, enabled: e.target.checked }
                                        })}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            
                            {notifications.desktop.enabled && (
                                <>
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-title">Scan Complete</span>
                                            <span className="toggle-description">Pop-up when scans finish</span>
                                        </div>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.desktop.scanComplete}
                                                onChange={(e) => setNotifications({
                                                    ...notifications,
                                                    desktop: { ...notifications.desktop, scanComplete: e.target.checked }
                                                })}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-title">Critical Findings</span>
                                            <span className="toggle-description">Immediate pop-up for critical issues</span>
                                        </div>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.desktop.criticalFindings}
                                                onChange={(e) => setNotifications({
                                                    ...notifications,
                                                    desktop: { ...notifications.desktop, criticalFindings: e.target.checked }
                                                })}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="settings-card">
                            <h3>Slack Integration</h3>
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-title">Enable Slack Notifications</span>
                                    <span className="toggle-description">Send updates to your Slack channel</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={notifications.slack.enabled}
                                        onChange={(e) => setNotifications({
                                            ...notifications,
                                            slack: { ...notifications.slack, enabled: e.target.checked }
                                        })}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            
                            {notifications.slack.enabled && (
                                <>
                                    <div className="form-group">
                                        <label>Webhook URL</label>
                                        <input 
                                            type="text" 
                                            value={notifications.slack.webhook}
                                            onChange={(e) => setNotifications({
                                                ...notifications,
                                                slack: { ...notifications.slack, webhook: e.target.value }
                                            })}
                                            placeholder="https://hooks.slack.com/services/..."
                                        />
                                    </div>
                                    
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-title">Critical Findings Only</span>
                                            <span className="toggle-description">Only send alerts for critical vulnerabilities</span>
                                        </div>
                                        <label className="switch">
                                            <input 
                                                type="checkbox" 
                                                checked={notifications.slack.sendCritical}
                                                onChange={(e) => setNotifications({
                                                    ...notifications,
                                                    slack: { ...notifications.slack, sendCritical: e.target.checked }
                                                })}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                );
                
            case 'appearance':
                return (
                    <div className="settings-section">
                        <div className="section-header">
                            <h2>🎨 Appearance</h2>
                            <p className="section-description">Customize the look and feel of SecScan</p>
                        </div>
                        
                        <div className="settings-card">
                            <h3>🌓 Theme Mode</h3>
                            <div className="theme-selector">
                                <button 
                                    className={`theme-option ${appearance.theme === 'light' ? 'active' : ''}`}
                                    onClick={() => {
                                        setAppearance({...appearance, theme: 'light'});
                                        document.body.setAttribute('data-theme', 'light');
                                    }}
                                >
                                    <span className="theme-icon light-icon">☀️</span>
                                    <span className="theme-name">Light</span>
                                    <span className="theme-description">Bright and clean</span>
                                </button>
                                
                                <button 
                                    className={`theme-option ${appearance.theme === 'dark' ? 'active' : ''}`}
                                    onClick={() => {
                                        setAppearance({...appearance, theme: 'dark'});
                                        document.body.setAttribute('data-theme', 'dark');
                                    }}
                                >
                                    <span className="theme-icon dark-icon">🌙</span>
                                    <span className="theme-name">Dark</span>
                                    <span className="theme-description">Easy on the eyes</span>
                                </button>
                                
                                <button 
                                    className={`theme-option ${appearance.theme === 'system' ? 'active' : ''}`}
                                    onClick={() => {
                                        setAppearance({...appearance, theme: 'system'});
                                        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                        document.body.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
                                    }}
                                >
                                    <span className="theme-icon system-icon">💻</span>
                                    <span className="theme-name">System</span>
                                    <span className="theme-description">Follow your OS</span>
                                </button>
                            </div>
                            
                            {/* Live Preview */}
                            <div className="theme-preview-card">
                                <h4>Live Preview</h4>
                                <div className="preview-box">
                                    <div className="preview-header">
                                        <span className="preview-dot red"></span>
                                        <span className="preview-dot yellow"></span>
                                        <span className="preview-dot green"></span>
                                        <span className="preview-title">SecScan</span>
                                    </div>
                                    <div className="preview-content">
                                        <div className="preview-sidebar"></div>
                                        <div className="preview-main">
                                            <div className="preview-line"></div>
                                            <div className="preview-line"></div>
                                            <div className="preview-line short"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                       
                        <div className="settings-card">
                            <h3>📏 Layout Preferences</h3>
                            <div className="radio-group">
                                <label className="radio-label">
                                    <input 
                                        type="radio" 
                                        name="sidebar" 
                                        value="expanded"
                                        checked={appearance.sidebarBehavior === 'expanded'}
                                        onChange={(e) => setAppearance({...appearance, sidebarBehavior: e.target.value})}
                                    />
                                    <div className="radio-info">
                                        <span className="radio-title">Expanded Sidebar</span>
                                        <span className="radio-description">Always show full sidebar with labels</span>
                                    </div>
                                </label>
                                
                                <label className="radio-label">
                                    <input 
                                        type="radio" 
                                        name="sidebar" 
                                        value="collapsible"
                                        checked={appearance.sidebarBehavior === 'collapsible'}
                                        onChange={(e) => setAppearance({...appearance, sidebarBehavior: e.target.value})}
                                    />
                                    <div className="radio-info">
                                        <span className="radio-title">Collapsible Sidebar</span>
                                        <span className="radio-description">Sidebar can be collapsed to icons only</span>
                                    </div>
                                </label>
                                
                                <label className="radio-label">
                                    <input 
                                        type="radio" 
                                        name="sidebar" 
                                        value="mini"
                                        checked={appearance.sidebarBehavior === 'mini'}
                                        onChange={(e) => setAppearance({...appearance, sidebarBehavior: e.target.value})}
                                    />
                                    <div className="radio-info">
                                        <span className="radio-title">Mini Sidebar</span>
                                        <span className="radio-description">Always collapsed, icons only</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <div className="settings-card">
                            <h3>🔤 Typography</h3>
                            <div className="form-group">
                                <label>Font Size</label>
                                <select 
                                    value={appearance.fontSize}
                                    onChange={(e) => {
                                        const newSize = e.target.value;
                                        setAppearance({...appearance, fontSize: newSize});
                                        document.body.setAttribute('data-font-size', newSize);
                                    }}
                                    className="select-styled"
                                >
                                    <option value="small">Small - 14px</option>
                                    <option value="medium">Medium - 16px</option>
                                    <option value="large">Large - 18px</option>
                                    <option value="xlarge">Extra Large - 20px</option>
                                </select>
                                
                                <div className="font-preview">
                                    <p>Preview text at {appearance.fontSize} size</p>
                                    <div className="preview-text-samples">
                                        <span className="text-xs">Extra small</span>
                                        <span className="text-sm">Small</span>
                                        <span className="text-base">Base</span>
                                        <span className="text-lg">Large</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="settings-card">
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-title">Compact Mode</span>
                                    <span className="toggle-description">Reduce spacing to show more content</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={appearance.compactMode}
                                        onChange={(e) => setAppearance({...appearance, compactMode: e.target.checked})}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-title">Enable Animations</span>
                                    <span className="toggle-description">Smooth transitions and effects</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={appearance.animations}
                                        onChange={(e) => setAppearance({...appearance, animations: e.target.checked})}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-title">Blur Effects</span>
                                    <span className="toggle-description">Enable backdrop blur on modals</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={appearance.blurEffects}
                                        onChange={(e) => setAppearance({...appearance, blurEffects: e.target.checked})}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                );
                
            case 'api':
                return (
                    <div className="settings-section">
                        <div className="section-header">
                            <h2>🔌 API Keys & Integrations</h2>
                            <p className="section-description">Manage your API keys for external services</p>
                        </div>
                        
                        <div className="settings-card">
                            <div className="api-service-header">
                                <div className="service-info">
                                    <span className="service-icon">🦠</span>
                                    <h3>VirusTotal</h3>
                                </div>
                                <span className={`service-status ${apiKeys.virustotal.status}`}>
                                    {apiKeys.virustotal.status === 'configured' ? '✓ Connected' : '○ Not configured'}
                                </span>
                            </div>
                            
                            <div className="api-key-row">
                                <div className="api-key-input-wrapper">
                                    <input 
                                        type={apiKeys.virustotal.showKey ? "text" : "password"}
                                        value={apiKeys.virustotal.key}
                                        onChange={(e) => updateApiKey('virustotal', e.target.value)}
                                        placeholder="Enter your VirusTotal API key"
                                    />
                                    <button 
                                        className="toggle-visibility"
                                        onClick={() => toggleKeyVisibility('virustotal')}
                                    >
                                        {apiKeys.virustotal.showKey ? '👁️' : '🙈'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="api-limits">
                                <span>🔒 Free tier: 500 scans/day</span>
                                <span>⚡ 4 scans/minute limit</span>
                            </div>
                        </div>
                        
                        <div className="settings-card">
                            <div className="api-service-header">
                                <div className="service-info">
                                    <span className="service-icon">🤖</span>
                                    <h3>DeepSeek AI</h3>
                                </div>
                                <span className={`service-status ${apiKeys.deepseek.status}`}>
                                    {apiKeys.deepseek.status === 'configured' ? '✓ Connected' : '○ Not configured'}
                                </span>
                            </div>
                            
                            <div className="api-key-row">
                                <div className="api-key-input-wrapper">
                                    <input 
                                        type={apiKeys.deepseek.showKey ? "text" : "password"}
                                        value={apiKeys.deepseek.key}
                                        onChange={(e) => updateApiKey('deepseek', e.target.value)}
                                        placeholder="Enter your DeepSeek API key"
                                    />
                                    <button 
                                        className="toggle-visibility"
                                        onClick={() => toggleKeyVisibility('deepseek')}
                                    >
                                        {apiKeys.deepseek.showKey ? '👁️' : '🙈'}
                                    </button>
                                </div>
                            </div>
                            
                            <p className="api-note">🔐 Your API keys are stored locally and never sent to our servers</p>
                        </div>
                    </div>
                );
                
            case 'data':
                return (
                    <div className="settings-section">
                        <div className="section-header">
                            <h2>📊 Data Management</h2>
                            <p className="section-description">Control your data and privacy settings</p>
                        </div>
                        
                        <div className="stats-card">
                            <div className="stat-item-large">
                                <span className="stat-value-large">{dataSettings.scanHistory}</span>
                                <span className="stat-label-large">Total Scans</span>
                            </div>
                            <div className="stat-item-large">
                                <span className="stat-value-large">2.4 GB</span>
                                <span className="stat-label-large">Storage Used</span>
                            </div>
                        </div>
                        
                        <div className="settings-card">
                            <h3>Retention Settings</h3>
                            <div className="form-group">
                                <label>Keep scan history for</label>
                                <select 
                                    value={dataSettings.retentionDays}
                                    onChange={(e) => setDataSettings({...dataSettings, retentionDays: parseInt(e.target.value)})}
                                    className="select-styled"
                                >
                                    <option value={30}>30 days</option>
                                    <option value={90}>90 days</option>
                                    <option value={180}>180 days</option>
                                    <option value={365}>1 year</option>
                                    <option value={0}>Forever</option>
                                </select>
                            </div>
                            
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-title">Auto-delete old scans</span>
                                    <span className="toggle-description">Automatically remove scans older than retention period</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={dataSettings.autoDelete}
                                        onChange={(e) => setDataSettings({...dataSettings, autoDelete: e.target.checked})}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-title">Share anonymous usage data</span>
                                    <span className="toggle-description">Help us improve SecScan</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={dataSettings.shareAnalytics}
                                        onChange={(e) => setDataSettings({...dataSettings, shareAnalytics: e.target.checked})}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="settings-card">
                            <h3>Export Options</h3>
                            <div className="button-grid">
                                <button className="button-primary" onClick={exportData}>
                                    📥 Export All Data (JSON)
                                </button>
                                <button className="button-primary">📄 Export as PDF</button>
                                <button className="button-primary">📦 Download Reports Archive</button>
                            </div>
                        </div>
                        
                        <div className="danger-zone">
                            <h3>⚠️ Danger Zone</h3>
                            <p>Once you delete your data, there is no going back. Please be certain.</p>
                            <button className="button-danger" onClick={() => setShowDeleteConfirm(true)}>
                                🗑️ Clear All Scan History
                            </button>
                        </div>
                    </div>
                );
                
            case 'security':
                return (
                    <div className="settings-section">
                        <div className="section-header">
                            <h2>🛡️ Security Settings</h2>
                            <p className="section-description">Manage your account security and authentication</p>
                        </div>
                        
                        <div className="settings-card">
                            <h3>Two-Factor Authentication</h3>
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-title">Enable 2FA</span>
                                    <span className="toggle-description">Add an extra layer of security to your account</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={security.twoFactorEnabled}
                                        onChange={(e) => setSecurity({...security, twoFactorEnabled: e.target.checked})}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                            
                            {!security.twoFactorEnabled && (
                                <button className="button-secondary">Setup Two-Factor Authentication</button>
                            )}
                        </div>
                        
                        <div className="settings-card">
                            <h3>Session Management</h3>
                            <div className="form-group">
                                <label>Session Timeout (minutes)</label>
                                <select 
                                    value={security.sessionTimeout}
                                    onChange={(e) => setSecurity({...security, sessionTimeout: parseInt(e.target.value)})}
                                    className="select-styled"
                                >
                                    <option value={15}>15 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={120}>2 hours</option>
                                    <option value={480}>8 hours</option>
                                </select>
                            </div>
                            
                            <div className="toggle-item">
                                <div className="toggle-info">
                                    <span className="toggle-title">Login Notifications</span>
                                    <span className="toggle-description">Get email alerts for new sign-ins</span>
                                </div>
                                <label className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={security.loginNotifications}
                                        onChange={(e) => setSecurity({...security, loginNotifications: e.target.checked})}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div className="settings-card">
                            <h3>Recent Activity</h3>
                            <div className="activity-item">
                                <span className="activity-icon">🔓</span>
                                <div className="activity-details">
                                    <span className="activity-title">Last Login</span>
                                    <span className="activity-time">{security.lastLogin}</span>
                                </div>
                                <span className="activity-ip">{security.lastLoginIP}</span>
                            </div>
                            <button className="button-link">View Full Login History →</button>
                        </div>
                    </div>
                );
                
            case 'about':
                return (
                    <div className="settings-section">
                        <div className="about-hero">
                            <div className="app-logo-large">🛡️</div>
                            <h1>SecScan</h1>
                            <p className="version">Version 2.1.0</p>
                            <p className="tagline">Advanced Security Scanner Platform</p>
                        </div>
                        
                        <div className="about-grid">
                            <div className="about-card-item">
                                <span className="about-icon">📦</span>
                                <span className="about-label">React 18.2.0</span>
                            </div>
                            <div className="about-card-item">
                                <span className="about-icon">🔥</span>
                                <span className="about-label">Flask API</span>
                            </div>
                            <div className="about-card-item">
                                <span className="about-icon">🗄️</span>
                                <span className="about-label">SQLite</span>
                            </div>
                            <div className="about-card-item">
                                <span className="about-icon">📝</span>
                                <span className="about-label">MIT License</span>
                            </div>
                        </div>
                        
                        <div className="about-links">
                            <button className="social-button" onClick={() => window.open('https://github.com', '_blank')}>
                                <span className="social-icon">📚</span>
                                Documentation
                            </button>
                            <button className="social-button" onClick={() => window.open('https://github.com', '_blank')}>
                                <span className="social-icon">🐛</span>
                                Report Bug
                            </button>
                            <button className="social-button" onClick={() => window.open('https://discord.com', '_blank')}>
                                <span className="social-icon">💬</span>
                                Join Discord
                            </button>
                            <button className="social-button" onClick={() => window.open('https://github.com', '_blank')}>
                                <span className="social-icon">⭐</span>
                                GitHub
                            </button>
                        </div>
                        
                        <button className="button-primary update-button">
                            🔄 Check for Updates
                        </button>
                        
                        <p className="copyright">© 2026 SecScan. All rights reserved.</p>
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <button className="back-button" onClick={onBack}>
                    ← Back
                </button>
                <div className="header-title">
                    <h1>Settings</h1>
                    <p>Customize your SecScan experience</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {/* THEME TOGGLE BUTTON - THIS WAS MISSING! */}
                    <button onClick={toggleTheme} className="theme-toggle-btn">
    {appearance.theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
</button>
                    <button className="save-button" onClick={saveSettings}>
                        💾 Save Changes
                    </button>
                </div>
                {saveStatus === 'saved' && <span className="save-status">✓ Saved!</span>}
            </div>

            <div className="settings-layout">
                <div className="settings-sidebar">
                    {[
                        { id: 'profile', icon: '👤', label: 'Profile' },
                        { id: 'notifications', icon: '🔔', label: 'Notifications' },
                        { id: 'appearance', icon: '🎨', label: 'Appearance' },
                        { id: 'api', icon: '🔌', label: 'API Keys' },
                        { id: 'data', icon: '📊', label: 'Data' },
                        { id: 'security', icon: '🛡️', label: 'Security' },
                        { id: 'about', icon: 'ℹ️', label: 'About' }
                    ].map(item => (
                        <button
                            key={item.id}
                            className={`settings-nav-item ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                            <span className="nav-arrow">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="settings-content">
                    {renderSection()}
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>🔑 Change Password</h2>
                        <p>Enter your current password and choose a new one</p>
                        
                        <div className="form-group">
                            <label>Current Password</label>
                            <input type="password" placeholder="••••••••" />
                        </div>
                        
                        <div className="form-group">
                            <label>New Password</label>
                            <input type="password" placeholder="••••••••" />
                        </div>
                        
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input type="password" placeholder="••••••••" />
                        </div>
                        
                        <div className="modal-actions">
                            <button className="button-primary">Update Password</button>
                            <button className="button-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content warning">
                        <h2>⚠️ Clear All Scan History?</h2>
                        <p>This action cannot be undone. All scan results, reports, and historical data will be permanently deleted.</p>
                        
                        <div className="modal-actions">
                            <button className="button-danger" onClick={deleteAccount}>Yes, Delete Everything</button>
                            <button className="button-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;