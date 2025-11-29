import React, { useState } from 'react';
import { useHistory } from '../context/HistoryContext';
import PromptGenerator from './PromptGenerator';
import './ReplicateStudio.css';

type MediaType = 'video' | 'image' | 'audio' | 'custom';

const ReplicateStudio: React.FC = () => {
    // const { tone } = useProject(); // Unused for now
    const { addToHistory } = useHistory();
    const [activeTab, setActiveTab] = useState<MediaType>('video');
    const [prompt, setPrompt] = useState('');
    const [customModelId, setCustomModelId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [showPromptGen, setShowPromptGen] = useState(false);

    // Auto-fill from Quick Create
    React.useEffect(() => {
        const autoStart = localStorage.getItem('quick_create_autostart');
        const quickPrompt = localStorage.getItem('quick_create_prompt');
        const quickType = localStorage.getItem('quick_create_type');

        if (autoStart === 'true' && quickPrompt) {
            setPrompt(quickPrompt);
            if (quickType === 'video') setActiveTab('video');
            if (quickType === 'image') setActiveTab('image');

            // Clear flags so it doesn't run on refresh
            localStorage.removeItem('quick_create_autostart');
            localStorage.removeItem('quick_create_prompt');
            localStorage.removeItem('quick_create_type');
        }
    }, []);

    // Placeholder for API Key check
    const apiKey = localStorage.getItem('replicate_api_key');

    const handleRun = async () => {
        if (!apiKey) {
            alert("Please set your Replicate API Key in Settings first!");
            return;
        }

        setIsProcessing(true);
        setLogs(prev => [...prev, `Starting ${activeTab} generation...`]);
        setResult(null);

        try {
            // 1. Determine Model and Version
            let modelVersion = customModelId;
            let inputPayload: any = { prompt };

            if (activeTab === 'video') {
                // Real-ESRGAN for Video Upscaling (using generic-video-upscaler placeholder)
                modelVersion = "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73ab415c7259e3b9c4220";

                if (prompt.startsWith('http') || prompt.startsWith('data:')) {
                    inputPayload = { image: prompt, scale: 2, face_enhance: true };
                }
            } else if (activeTab === 'image') {
                // Flux Schnell
                modelVersion = "black-forest-labs/flux-schnell";
                inputPayload = { prompt, aspect_ratio: "16:9" };
            } else if (activeTab === 'audio') {
                // MusicGen
                modelVersion = "meta/musicgen:7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906";
                inputPayload = { prompt, duration: 15 };
                if (prompt.startsWith('data:')) {
                    // If data URI, treat as input audio for melody
                    inputPayload = {
                        prompt: "remix with a strong beat",
                        input_audio: prompt,
                        duration: 15,
                        model_version: "melody"
                    };
                }
            }

            // Override if Custom
            if (activeTab === 'custom') {
                modelVersion = customModelId;
                try {
                    const jsonInput = JSON.parse(prompt);
                    inputPayload = jsonInput;
                } catch (e) {
                    inputPayload = { prompt };
                }
            }

            setLogs(prev => [...prev, `Selected Model: ${modelVersion}`]);

            // 2. Create Prediction (POST)
            const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: modelVersion.split(':')[1] || modelVersion,
                    input: inputPayload,
                }),
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`API Error: ${response.status} - ${err}`);
            }

            const prediction = await response.json();
            setLogs(prev => [...prev, `Job ID: ${prediction.id} - Status: ${prediction.status}`]);

            // 3. Poll for Result
            const pollEndpoint = prediction.urls.get;

            const pollInterval = setInterval(async () => {
                const pollRes = await fetch(pollEndpoint, {
                    headers: {
                        'Authorization': `Token ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                });

                const statusData = await pollRes.json();
                setLogs(prev => [...prev, `Status: ${statusData.status}`]);

                if (statusData.status === 'succeeded') {
                    clearInterval(pollInterval);
                    setIsProcessing(false);
                    setResult(statusData.output);
                    setLogs(prev => [...prev, "Generation Complete!"]);

                    // Add to History
                    addToHistory({
                        type: activeTab === 'image' ? 'image' : activeTab === 'video' ? 'video' : 'chat', // approximate types
                        content: activeTab === 'custom' ? `Custom Model: ${customModelId}` : prompt.slice(0, 50),
                        metadata: {
                            url: Array.isArray(statusData.output) ? statusData.output[0] : statusData.output,
                            model: modelVersion
                        }
                    });

                } else if (statusData.status === 'failed' || statusData.status === 'canceled') {
                    clearInterval(pollInterval);
                    setIsProcessing(false);
                    setLogs(prev => [...prev, `Job Failed: ${statusData.error}`]);
                }
            }, 2000);

        } catch (error: any) {
            console.error(error);
            setIsProcessing(false);
            setLogs(prev => [...prev, `Error: ${error.message}`]);
            if (error.message.includes('Failed to fetch')) {
                setLogs(prev => [...prev, "CORS Error: The browser blocked the request. You may need a CORS proxy or backend."]);
            }
        }
    };

    return (
        <div className="replicate-studio glass-panel">
            <div className="studio-header">
                <h2>Replicate Studio</h2>
                <div className="studio-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
                        onClick={() => setActiveTab('video')}
                    >
                        🎬 Video FX
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'image' ? 'active' : ''}`}
                        onClick={() => setActiveTab('image')}
                    >
                        🎨 Image Lab
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
                        onClick={() => setActiveTab('audio')}
                    >
                        🎵 Audio
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
                        onClick={() => setActiveTab('custom')}
                    >
                        🧠 Custom Model
                    </button>
                </div>
            </div>

            <div className="studio-content">
                <div className="studio-controls">
                    {activeTab === 'custom' && (
                        <div className="control-group">
                            <label>Model ID (owner/name:version)</label>
                            <input
                                type="text"
                                value={customModelId}
                                onChange={(e) => setCustomModelId(e.target.value)}
                                placeholder="e.g. stability-ai/sdxl:39ed52f2..."
                            />
                        </div>
                    )}

                    <div className="control-group">
                        <label>Prompt / Input</label>
                        <div className="prompt-wrapper" style={{ position: 'relative' }}>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={activeTab === 'custom' ? "Input JSON or Prompt..." : "Describe your desired output..."}
                                rows={4}
                                style={{ width: '100%' }}
                            />
                            <button
                                className="magic-btn-overlay"
                                onClick={() => setShowPromptGen(true)}
                                title="Enhance Prompt"
                                style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'var(--glass-highlight)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                ✨
                            </button>
                        </div>
                    </div>

                    {(activeTab === 'video' || activeTab === 'audio') && (
                        <div className="control-group">
                            <label>Input {activeTab === 'video' ? 'Video/Image' : 'Audio'}</label>
                            <div className="file-drop-zone">
                                <input
                                    type="file"
                                    accept={activeTab === 'video' ? "video/*,image/*" : "audio/*"}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setPrompt(reader.result as string); // Set data URI as prompt for now
                                                setLogs(prev => [...prev, `File loaded: ${file.name}`]);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer' }}
                                />
                                <span>Drag & Drop {activeTab === 'video' ? 'Video' : 'Audio'} Here</span>
                            </div>
                            <small style={{ color: '#666' }}>*File is converted to Data URI for API</small>
                        </div>
                    )}

                    <button
                        className="run-btn"
                        onClick={handleRun}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : '🚀 Run Model'}
                    </button>

                    <div className="console-logs">
                        {logs.map((log, i) => <div key={i} className="log-line">{log}</div>)}
                    </div>
                </div>

                <div className="studio-preview">
                    {result ? (
                        <div className="result-container">
                            {/* Replicate often returns an array of outputs */}
                            {Array.isArray(result) ? (
                                result.map((item, idx) => (
                                    <div key={idx} className="result-item">
                                        {activeTab === 'video' || (typeof item === 'string' && item.endsWith('.mp4')) ? (
                                            <video src={item} controls className="result-media" />
                                        ) : activeTab === 'audio' || (typeof item === 'string' && (item.endsWith('.mp3') || item.endsWith('.wav'))) ? (
                                            <audio src={item} controls className="result-media" />
                                        ) : (
                                            <img src={item} alt={`Result ${idx}`} className="result-media" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                // Single output
                                <div className="result-item">
                                    {activeTab === 'video' || (typeof result === 'string' && result.endsWith('.mp4')) ? (
                                        <video src={result} controls className="result-media" />
                                    ) : activeTab === 'audio' || (typeof result === 'string' && (result.endsWith('.mp3') || result.endsWith('.wav'))) ? (
                                        <audio src={result} controls className="result-media" />
                                    ) : (
                                        <img src={result} alt="Result" className="result-media" />
                                    )}
                                </div>
                            )}
                            <button className="download-btn" onClick={() => window.open(Array.isArray(result) ? result[0] : result, '_blank')}>
                                Download Result
                            </button>
                        </div>
                    ) : (
                        <div className="placeholder-preview">
                            <span>Output Preview</span>
                        </div>
                    )}
                </div>
            </div>

            {showPromptGen && (
                <PromptGenerator
                    type="image"
                    basePrompt={prompt.startsWith('data:') ? '' : prompt}
                    onClose={() => setShowPromptGen(false)}
                    onPromptGenerated={(newPrompt) => setPrompt(newPrompt)}
                />
            )}
        </div>
    );
};

export default ReplicateStudio;
