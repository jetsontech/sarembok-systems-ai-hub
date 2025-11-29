import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import './PromptGenerator.css';

interface PromptGeneratorProps {
    basePrompt: string;
    onPromptGenerated: (prompt: string) => void;
    onClose: () => void;
    type: 'text' | 'image';
}

const PromptGenerator: React.FC<PromptGeneratorProps> = ({
    basePrompt,
    onPromptGenerated,
    onClose,
    type
}) => {
    const { contextDescription, tone } = useProject();
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [selectedTone, setSelectedTone] = useState(tone || 'Professional');

    const handleEnhance = async () => {
        setIsEnhancing(true);

        try {
            const systemContext = contextDescription ? `Context: ${contextDescription}. ` : '';
            let prompt = '';

            if (type === 'text') {
                prompt = `Rewrite this prompt for an AI chat model to be more detailed. ${systemContext}Tone: ${selectedTone}. Input: "${basePrompt}". Return only the enhanced text.`;
            } else {
                prompt = `Rewrite this prompt for an AI image generator with visual details. ${systemContext}Style: ${selectedTone}. Input: "${basePrompt}". Return only the enhanced text.`;
            }

            const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);

            if (!response.ok) {
                throw new Error('API Error');
            }

            const text = await response.text();
            onPromptGenerated(text);
            onClose();
        } catch (error) {
            console.error('Enhancement failed:', error);
            // Fallback if API fails
            onPromptGenerated(`${basePrompt} (Enhanced: ${tone} mode)`);
            onClose();
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <div className="prompt-generator-overlay">
            <div className="prompt-generator glass-panel">
                <div className="pg-header">
                    <h3>✨ AI Prompt Enhancer</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="pg-content">
                    <div className="pg-info">
                        <p><strong>Input:</strong> "{basePrompt}"</p>
                        <p><strong>Context:</strong> {contextDescription || 'None'}</p>
                        <div className="pg-tone-select">
                            <label>Tone:</label>
                            <select
                                value={selectedTone}
                                onChange={(e) => setSelectedTone(e.target.value)}
                                className="glass-select-small"
                            >
                                <option value="Professional">Professional</option>
                                <option value="Creative">Creative</option>
                                <option value="Casual">Casual</option>
                                <option value="Academic">Academic</option>
                                <option value="Dramatic">Dramatic</option>
                                <option value="Cyberpunk">Cyberpunk</option>
                            </select>
                        </div>
                    </div>

                    <div className="pg-actions">
                        <button
                            className="enhance-btn"
                            onClick={handleEnhance}
                            disabled={isEnhancing}
                        >
                            {isEnhancing ? (
                                <>
                                    <span className="spinner"></span> Enhancing...
                                </>
                            ) : (
                                '✨ Generate Advanced Prompt'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptGenerator;
