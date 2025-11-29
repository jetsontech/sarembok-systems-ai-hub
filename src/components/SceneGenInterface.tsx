import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useHistory } from '../context/HistoryContext';
import PromptGenerator from './PromptGenerator';
import './SceneGenInterface.css';

const SceneGenInterface: React.FC = () => {
    const { contextDescription, tone } = useProject();
    const { addToHistory } = useHistory();
    const [sceneName, setSceneName] = useState('');
    const [lighting, setLighting] = useState('neutral');
    const [exposure, setExposure] = useState(1);
    const [physics, setPhysics] = useState('standard');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedScene, setGeneratedScene] = useState<boolean>(false);
    const [autoRotate, setAutoRotate] = useState(true);
    const [showPromptGen, setShowPromptGen] = useState(false);
    const [selectedModel, setSelectedModel] = useState('Astronaut');

    // Load state from localStorage
    useEffect(() => {
        const savedName = localStorage.getItem('scene_name');
        const savedLighting = localStorage.getItem('scene_lighting');
        const savedExposure = localStorage.getItem('scene_exposure');
        const savedPhysics = localStorage.getItem('scene_physics');
        const savedRotate = localStorage.getItem('scene_autorotate');

        // Check for Quick Create Auto-Start
        const quickPrompt = localStorage.getItem('quick_create_prompt');
        const quickAutoStart = localStorage.getItem('quick_create_autostart');
        const quickType = localStorage.getItem('quick_create_type');

        if (quickPrompt && quickAutoStart === 'true' && quickType === 'scene') {
            setSceneName(quickPrompt);
            localStorage.removeItem('quick_create_autostart');
            localStorage.removeItem('quick_create_prompt');

            // Auto-trigger generation
            setIsGenerating(true);
            setTimeout(() => {
                setIsGenerating(false);
                setGeneratedScene(true);
                addToHistory({
                    type: 'scene',
                    content: quickPrompt,
                    metadata: { lighting: 'neutral', physics: 'standard' }
                });
            }, 2000);
        } else {
            if (savedName) setSceneName(savedName);
            if (savedLighting) setLighting(savedLighting);
            if (savedExposure) setExposure(parseFloat(savedExposure));
            if (savedPhysics) setPhysics(savedPhysics);
            if (savedRotate) setAutoRotate(savedRotate === 'true');
        }
    }, []);

    // Save state to localStorage
    useEffect(() => {
        localStorage.setItem('scene_name', sceneName);
        localStorage.setItem('scene_lighting', lighting);
        localStorage.setItem('scene_exposure', exposure.toString());
        localStorage.setItem('scene_physics', physics);
        localStorage.setItem('scene_autorotate', autoRotate.toString());
    }, [sceneName, lighting, exposure, physics, autoRotate]);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setGeneratedScene(true);
            addToHistory({
                type: 'scene',
                content: sceneName || 'Untitled Scene',
                metadata: { lighting, physics }
            });
        }, 2000);
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    return (
        <div className="scene-gen-interface glass-panel">
            <div className="scene-controls">
                <div className="control-header">
                    <h3>SceneForge AI</h3>
                    <span className="status-indicator online">System Online</span>
                </div>

                <div className="input-group">
                    <label>Scene Name</label>
                    <div className="prompt-wrapper" style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={sceneName}
                            onChange={(e) => setSceneName(e.target.value)}
                            placeholder="e.g. Cyberpunk Alleyway"
                            style={{ flex: 1 }}
                        />
                        <button
                            className="magic-btn"
                            onClick={() => setShowPromptGen(true)}
                            title="Enhance Scene Idea"
                            style={{ width: '40px', padding: 0 }}
                        >
                            ✨
                        </button>
                    </div>
                </div>

                <div className="settings-grid">
                    <div className="setting">
                        <label>Environment (HDRI)</label>
                        <select value={lighting} onChange={(e) => setLighting(e.target.value)}>
                            <option value="neutral">Studio Neutral</option>
                            <option value="legacy">Legacy Sunset</option>
                            <option value="moon_1k">Moonlight</option>
                            <option value="spruit_sunrise_1k">Sunrise</option>
                        </select>
                    </div>
                    <div className="setting">
                        <label>Base Model</label>
                        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                            <option value="Astronaut">Astronaut</option>
                            <option value="RobotExpressive">Robot</option>
                            <option value="DamagedHelmet">Sci-Fi Helmet</option>
                            <option value="BoomBox">BoomBox</option>
                            <option value="Canoe">Canoe</option>
                        </select>
                    </div>
                    <div className="setting">
                        <label>Exposure (Brightness)</label>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={exposure}
                            onChange={(e) => setExposure(parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="setting">
                        <label>Physics Engine</label>
                        <select value={physics} onChange={(e) => setPhysics(e.target.value)}>
                            <option value="standard">Standard Gravity (9.8m/s²)</option>
                            <option value="low">Low Gravity (Moon)</option>
                            <option value="zero">Zero-G</option>
                        </select>
                    </div>
                    <div className="setting">
                        <label>View Controls</label>
                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={autoRotate}
                                    onChange={(e) => setAutoRotate(e.target.checked)}
                                />
                                Auto-Rotate
                            </label>
                        </div>
                    </div>
                </div>

                <div className="context-readout">
                    <small>Active Context: {contextDescription || 'None'}</small>
                    <small>Tone: {tone}</small>
                </div>

                <button
                    className="forge-btn"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'FORGING SCENE...' : 'FORGE SCENE'}
                </button>
            </div>

            <div className="scene-viewport glass-panel">
                {generatedScene ? (
                    <div className="viewport-content active">
                        {/* @ts-ignore */}
                        <model-viewer
                            src={`https://modelviewer.dev/shared-assets/models/${selectedModel}.glb`}
                            alt={`A 3D model of ${selectedModel}`}
                            auto-rotate={autoRotate ? "" : null}
                            camera-controls
                            shadow-intensity="1"
                            environment-image={lighting === 'neutral' ? 'neutral' : `https://modelviewer.dev/shared-assets/environments/${lighting}.hdr`}
                            exposure={exposure}
                            style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
                        >
                            {/* @ts-ignore */}
                        </model-viewer>

                        <div className="scene-overlay">
                            <div className="overlay-stat">POLYCOUNT: 1,240,592</div>
                            <div className="overlay-stat">FPS: 60</div>
                            <div className="overlay-stat">HDRI: {lighting.toUpperCase()}</div>
                        </div>
                    </div>
                ) : (
                    <div className="viewport-placeholder">
                        <div className="grid-lines"></div>
                        <div className="placeholder-text">
                            <span className="icon">🧊</span>
                            <p>Awaiting Scene Parameters</p>
                        </div>
                    </div>
                )}
            </div>

            {showPromptGen && (
                <PromptGenerator
                    type="image" // Scene gen is visual, so image type fits best
                    basePrompt={sceneName}
                    onClose={() => setShowPromptGen(false)}
                    onPromptGenerated={(newPrompt) => setSceneName(newPrompt)}
                />
            )}
        </div>
    );
};

export default SceneGenInterface;
