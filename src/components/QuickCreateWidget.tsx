import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PromptGenerator from './PromptGenerator';
import './QuickCreateWidget.css';

const QuickCreateWidget: React.FC = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [showPromptGen, setShowPromptGen] = useState(false);

    const handleAction = (type: 'image' | 'video' | 'scene') => {
        if (!prompt.trim()) return;

        // Save prompt and auto-start flag
        localStorage.setItem('quick_create_prompt', prompt);
        localStorage.setItem('quick_create_autostart', 'true');
        localStorage.setItem('quick_create_type', type);

        // Navigate to appropriate tool
        if (type === 'image') {
            navigate('/tool/nano-banana');
        } else if (type === 'video') {
            navigate('/tool/replicate-studio');
        } else if (type === 'scene') {
            navigate('/tool/sceneforge-ai');
        }
    };

    return (
        <div className="quick-create-widget glass-panel">
            <div className="qc-header">
                <span className="qc-title">⚡ Quick Create</span>
                <span className="qc-subtitle">Dream it. Build it. Instantly.</span>
            </div>

            <div className="qc-input-wrapper">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="What do you want to create today?"
                    className="qc-input"
                    onKeyPress={(e) => e.key === 'Enter' && handleAction('image')}
                />
                <button
                    className="qc-magic-btn"
                    onClick={() => setShowPromptGen(true)}
                    title="Enhance Idea"
                >
                    ✨
                </button>
            </div>

            <div className="qc-actions">
                <button className="qc-action-btn image" onClick={() => handleAction('image')}>
                    <span className="icon">🎨</span> Generate Image
                </button>
                <button className="qc-action-btn video" onClick={() => handleAction('video')}>
                    <span className="icon">🎬</span> Create Video
                </button>
                <button className="qc-action-btn scene" onClick={() => handleAction('scene')}>
                    <span className="icon">🧊</span> Forge 3D Scene
                </button>
            </div>

            {showPromptGen && (
                <PromptGenerator
                    type="image"
                    basePrompt={prompt}
                    onClose={() => setShowPromptGen(false)}
                    onPromptGenerated={(newPrompt) => setPrompt(newPrompt)}
                />
            )}
        </div>
    );
};

export default QuickCreateWidget;
