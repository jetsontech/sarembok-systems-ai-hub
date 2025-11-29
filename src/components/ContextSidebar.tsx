import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import './ContextSidebar.css';

const ContextSidebar: React.FC = () => {
    const {
        projectName, setProjectName,
        contextDescription, setContextDescription,
        tone, setTone,
        creationHistory, removeFromHistory
    } = useProject();

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className={`context-toggle glass-panel ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                🧠
            </button>

            <div className={`context-sidebar glass-panel ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Context Core</h3>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                </div>

                <div className="sidebar-content">
                    <div className="form-group">
                        <label>Project Name</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            className="glass-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Global Context</label>
                        <textarea
                            value={contextDescription}
                            onChange={(e) => setContextDescription(e.target.value)}
                            placeholder="e.g., Creating a Sci-Fi short film about AI..."
                            className="glass-input"
                            rows={4}
                        />
                        <p className="help-text">This context is auto-injected into all AI tools.</p>
                    </div>

                    <div className="form-group">
                        <label>Tone / Style</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="glass-input"
                        >
                            <option value="Professional">Professional</option>
                            <option value="Creative">Creative</option>
                            <option value="Technical">Technical</option>
                            <option value="Cinematic">Cinematic</option>
                            <option value="Casual">Casual</option>
                        </select>
                    </div>

                    <div className="status-indicator">
                        <span className="dot active"></span>
                        Context Active
                    </div>

                    {/* Creation History */}
                    <div className="creation-history">
                        <h4>Creation History</h4>
                        {creationHistory.length === 0 ? (
                            <p className="empty-state">No creations yet. Start building!</p>
                        ) : (
                            <div className="history-list">
                                {creationHistory.map(item => (
                                    <div key={item.id} className="history-item">
                                        <div className="history-icon">
                                            {item.type === 'landing-page' && '📄'}
                                            {item.type === 'ad-campaign' && '📢'}
                                            {item.type === 'video' && '🎬'}
                                            {item.type === 'image' && '🖼️'}
                                            {item.type === 'other' && '✨'}
                                        </div>
                                        <div className="history-content">
                                            <div className="history-name">{item.name}</div>
                                            {item.description && (
                                                <div className="history-desc">{item.description}</div>
                                            )}
                                            <div className="history-time">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="history-actions">
                                            {item.url && (
                                                <a
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn-view"
                                                >
                                                    View
                                                </a>
                                            )}
                                            <button
                                                onClick={() => removeFromHistory(item.id)}
                                                className="btn-remove"
                                                title="Remove from history"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContextSidebar;
