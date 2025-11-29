import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import './GlobalPromptEnhancer.css';

const GlobalPromptEnhancer: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [enhancedPrompt, setEnhancedPrompt] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const { contextDescription, tone } = useProject();
    const [selectedTone, setSelectedTone] = useState(tone || 'Professional');

    const handleEnhance = async () => {
        if (!input.trim()) return;
        setIsEnhancing(true);

        try {
            const systemContext = contextDescription ? `Context: ${contextDescription}. ` : '';
            // Simplified prompt to reduce "safety block" false positives from strict upstream filters
            const prompt = `Rewrite this prompt to be more descriptive and high-quality. ${systemContext}Tone: ${selectedTone}. Input: "${input}". Return only the enhanced text.`;

            const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Enhance API Error:', errorText);
                if (errorText.includes('content_filter') || errorText.includes('content management policy')) {
                    setEnhancedPrompt(`⚠️ Safety Block: The AI flagged this request. Try removing sensitive keywords.\n(Debug: ${errorText.slice(0, 100)}...)`);
                } else {
                    setEnhancedPrompt(`⚠️ Service Error: ${response.statusText}`);
                }
                return;
            }

            const text = await response.text();
            setEnhancedPrompt(text);
        } catch (error) {
            console.error('Enhancement failed:', error);
            setEnhancedPrompt('Could not enhance prompt. Please check your connection.');
        } finally {
            setIsEnhancing(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(enhancedPrompt);
        setIsOpen(false);
    };

    return (
        <>
            <button
                className={`fab-enhancer ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="AI Prompt Enhancer"
            >
                ✨
            </button>

            {isOpen && (
                <div className="enhancer-modal glass-panel">
                    <div className="enhancer-header">
                        <h3>Global Prompt Enhancer</h3>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="enhancer-body">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter your basic idea..."
                            rows={3}
                        />

                        <div className="enhancer-controls">
                            <div className="tone-selector">
                                <select
                                    value={selectedTone}
                                    onChange={(e) => setSelectedTone(e.target.value)}
                                    className="glass-select"
                                >
                                    <option value="Professional">Professional</option>
                                    <option value="Creative">Creative</option>
                                    <option value="Casual">Casual</option>
                                    <option value="Academic">Academic</option>
                                    <option value="Dramatic">Dramatic</option>
                                    <option value="Cyberpunk">Cyberpunk</option>
                                </select>
                            </div>
                            <button
                                className="enhance-btn"
                                onClick={handleEnhance}
                                disabled={isEnhancing || !input.trim()}
                            >
                                {isEnhancing ? 'Enhancing...' : '✨ Enhance'}
                            </button>
                        </div>

                        {enhancedPrompt && (
                            <div className="result-area">
                                <p>{enhancedPrompt}</p>
                                <button className="copy-btn" onClick={copyToClipboard}>
                                    Copy & Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default GlobalPromptEnhancer;
