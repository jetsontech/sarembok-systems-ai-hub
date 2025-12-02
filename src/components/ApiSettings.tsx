import React, { useState, useEffect } from 'react';
import './ApiSettings.css';

interface ApiSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({ isOpen, onClose }) => {
    const [replicateKey, setReplicateKey] = useState('');
    const [videoProvider, setVideoProvider] = useState('simulation');

    useEffect(() => {
        const storedReplicate = localStorage.getItem('replicate_key');
        const storedProvider = localStorage.getItem('video_provider');

        if (storedReplicate) setReplicateKey(storedReplicate);
        if (storedProvider) setVideoProvider(storedProvider);
    }, [setReplicateKey, setVideoProvider]);

    const handleSave = () => {
        localStorage.setItem('replicate_key', replicateKey);
        localStorage.setItem('video_provider', videoProvider);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="api-settings-overlay">
            <div className="api-settings glass-panel">
                <div className="settings-header">
                    <h3>⚙️ Pro Nexus Settings</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="settings-content">
                    <p className="settings-desc">
                        Enter your API keys to unlock <strong>Real Deal</strong> video generation and premium features.
                        Keys are stored locally on your device.
                    </p>

                    <div className="input-group">
                        <label>Video Provider</label>
                        <select
                            className="glass-input"
                            value={videoProvider}
                            onChange={(e) => setVideoProvider(e.target.value)}
                        >
                            <option value="simulation">Simulation Mode (Free)</option>
                            <option value="replicate">Replicate (Real AI - Paid)</option>
                        </select>
                    </div>

                    {videoProvider === 'replicate' && (
                        <div className="input-group">
                            <label>Replicate API Token</label>
                            <input
                                type="password"
                                value={replicateKey}
                                onChange={(e) => setReplicateKey(e.target.value)}
                                placeholder="r8_..."
                                className="glass-input"
                            />
                            <small style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                                Required for Replicate mode. Get one at <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noreferrer">replicate.com</a>
                            </small>
                        </div>
                    )}

                    <div className="settings-actions">
                        <button className="save-btn" onClick={handleSave}>Save & Activate</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiSettings;
