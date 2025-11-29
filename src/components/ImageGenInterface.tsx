import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useHistory } from '../context/HistoryContext';
import PromptGenerator from './PromptGenerator';
import ApiSettings from './ApiSettings';
import './ImageGenInterface.css';

const ImageGenInterface: React.FC = () => {
    const { contextDescription, tone } = useProject();
    const { addToHistory } = useHistory();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isVideoGenerating, setIsVideoGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
    const [showPromptGen, setShowPromptGen] = useState(false);
    const [showApiSettings, setShowApiSettings] = useState(false);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [statusMessage, setStatusMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load state from localStorage on mount
    useEffect(() => {
        const savedPrompt = localStorage.getItem('nano_prompt');
        const savedImage = localStorage.getItem('nano_image');
        const savedVideo = localStorage.getItem('nano_video');

        // Check for Quick Create Auto-Start
        const quickPrompt = localStorage.getItem('quick_create_prompt');
        const quickAutoStart = localStorage.getItem('quick_create_autostart');
        const quickType = localStorage.getItem('quick_create_type');

        if (quickPrompt && quickAutoStart === 'true') {
            setPrompt(quickPrompt);
            // Clear flags immediately to prevent loops
            localStorage.removeItem('quick_create_autostart');
            localStorage.removeItem('quick_create_prompt'); // Optional: keep prompt? Better to keep it in state.

            // Auto-trigger based on type
            // We need to wait a tick for state to update, but since we are inside useEffect, 
            // we can't call handleGenerate immediately if it depends on 'prompt' state which is not yet updated.
            // So we'll use a timeout and pass the prompt directly if possible, or rely on a separate effect.

            // Better approach: Set a local flag to trigger effect
            setTimeout(() => {
                if (quickType === 'image') {
                    // We need to call the generation logic directly here or expose it
                    // Re-implementing core logic for safety
                    const encodedPrompt = encodeURIComponent(quickPrompt + ' ' + tone + ' style');
                    const randomSeed = Math.floor(Math.random() * 1000);
                    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&seed=${randomSeed}&nologo=true`;

                    setIsGenerating(true);
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = imageUrl;
                    img.onload = () => {
                        setGeneratedImage(imageUrl);
                        setIsGenerating(false);
                        addToHistory({ type: 'image', content: quickPrompt, metadata: { url: imageUrl, aspectRatio: '16:9' } });
                    };
                }
            }, 500);
        } else {
            if (savedPrompt) setPrompt(savedPrompt);
            if (savedImage) setGeneratedImage(savedImage);
            if (savedVideo) setGeneratedVideo(savedVideo);
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('nano_prompt', prompt);
        if (generatedImage) localStorage.setItem('nano_image', generatedImage);
        if (generatedVideo) localStorage.setItem('nano_video', generatedVideo);
    }, [prompt, generatedImage, generatedVideo]);

    const handleGenerate = () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setGeneratedImage(null);
        setGeneratedVideo(null);
        setStatusMessage('');

        // Calculate dimensions based on aspect ratio
        let width = 1024;
        let height = 1024;
        if (aspectRatio === '16:9') { width = 1280; height = 720; }
        else if (aspectRatio === '21:9') { width = 1536; height = 640; } // Cinematic
        else if (aspectRatio === '2.39:1') { width = 1536; height = 642; } // Anamorphic
        else if (aspectRatio === '9:16') { width = 720; height = 1280; }
        else if (aspectRatio === '4:3') { width = 1024; height = 768; }

        // Use Pollinations AI for real generated images
        const encodedPrompt = encodeURIComponent(prompt + ' ' + tone + ' style');
        const randomSeed = Math.floor(Math.random() * 1000);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${randomSeed}&nologo=true`;

        const img = new Image();
        img.crossOrigin = "anonymous"; // Enable CORS for canvas/blob operations
        img.src = imageUrl;
        img.onload = () => {
            setGeneratedImage(imageUrl);
            setIsGenerating(false);
            addToHistory({
                type: 'image',
                content: prompt,
                metadata: { url: imageUrl, aspectRatio }
            });
        };
        img.onerror = () => {
            setIsGenerating(false);
            setStatusMessage('Error generating image. Please try again.');
        };
    };

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);

        if (file.type.startsWith('image/')) {
            setGeneratedImage(url);
            setGeneratedVideo(null);
            setStatusMessage('Image uploaded. Ready for video conversion.');
        } else if (file.type.startsWith('video/')) {
            setGeneratedVideo(url);
            setGeneratedImage(null);
            setStatusMessage('Video uploaded.');
        }
    };

    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    const handleDownload = async () => {
        const urlToDownload = generatedVideo || generatedImage;
        if (!urlToDownload) return;

        try {
            const response = await fetch(urlToDownload);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Create link
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = generatedVideo ? `ai-hub-video-${Date.now()}.mp4` : `ai-hub-image-${Date.now()}.png`;
            document.body.appendChild(a);

            // Trigger click
            a.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);

            // Fallback for iOS if download doesn't trigger
            // iOS Safari often blocks programmatic downloads of blobs
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
            if (isIOS) {
                setStatusMessage('📱 iOS detected: If download fails, tap and hold the image to save.');
            }

        } catch (err) {
            console.error('Download failed', err);
            setStatusMessage('Download failed. Try long-pressing the media to save.');
            // Last resort fallback: open in new tab
            window.open(urlToDownload, '_blank');
        }
    };

    const handleShare = async () => {
        const urlToShare = generatedVideo || generatedImage;
        if (!urlToShare) return;

        // Check if Web Share API is supported AND we are in a secure context (HTTPS)
        // Note: Localhost is considered secure, but local IP (192.168...) is NOT secure unless configured.
        if (navigator.share && (window.isSecureContext || window.location.hostname === 'localhost')) {
            try {
                const response = await fetch(urlToShare);
                const blob = await response.blob();
                const file = new File([blob], generatedVideo ? 'video.mp4' : 'image.png', {
                    type: generatedVideo ? 'video/mp4' : 'image/png'
                });
                await navigator.share({
                    title: 'AI Generated Media',
                    text: prompt,
                    files: [file]
                });
            } catch (err) {
                console.error('Share failed', err);
                setStatusMessage('Share failed. Try downloading first.');
            }
        } else {
            // Fallback for non-secure contexts (like local IP testing)
            setStatusMessage('⚠️ Sharing requires HTTPS. Long-press the image to copy/share.');
            // Optional: Copy URL to clipboard if it's a remote URL (not blob)
            if (urlToShare.startsWith('http')) {
                navigator.clipboard.writeText(urlToShare).then(() => {
                    setStatusMessage('Link copied to clipboard! (Web Share unavailable)');
                });
            }
        }
    };

    const handleVideo = async () => {
        if (!generatedImage) return;

        const provider = localStorage.getItem('video_provider') || 'simulation';

        if (provider === 'simulation') {
            setIsVideoGenerating(true);
            setStatusMessage('Initializing video generation (Simulation Mode)...');

            // Simulate processing time
            setTimeout(() => { setStatusMessage('Analyzing image depth...'); }, 1000);
            setTimeout(() => { setStatusMessage('Applying motion vectors...'); }, 2500);
            setTimeout(() => { setStatusMessage('Rendering video frames...'); }, 4000);
            setTimeout(() => {
                setGeneratedVideo('simulation');
                setStatusMessage('Video generated successfully! (Simulated Preview)');
                setIsVideoGenerating(false);
                addToHistory({
                    type: 'video',
                    content: `Simulated Video: ${prompt.slice(0, 30)}...`,
                    metadata: { url: generatedImage, isSimulation: true }
                });
            }, 5500);
            return;
        }

        // Replicate Mode
        const key = localStorage.getItem('replicate_key');
        if (!key) {
            alert('Please set your Replicate API Token in Settings first.');
            setShowApiSettings(true);
            return;
        }

        setIsVideoGenerating(true);
        setStatusMessage('Initializing Replicate session...');

        try {
            // 1. Create Prediction
            setStatusMessage('Sending to Stable Video Diffusion...');

            // Note: Direct client-side calls to Replicate are not recommended for production due to exposed keys,
            // but for a local playground, we use a proxy or direct call if allowed.
            // Replicate's official proxy is often used, but here we'll try a direct fetch to their API.
            // If CORS blocks this, we would need a proxy.

            const response = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: "3f0457e4619daac51203dedb4728164e205f0e127afc16ff825aa04552642f93", // SVD XT
                    input: {
                        cond_aug: 0.02,
                        decoding_t: 7,
                        input_image: generatedImage,
                        video_length: "14_frames_with_svd_xt",
                        sizing_strategy: "maintain_aspect_ratio",
                        motion_bucket_id: 127,
                        frames_per_second: 6
                    }
                })
            });

            if (!response.ok) {
                // Check for CORS error hint or auth error
                if (response.status === 401) throw new Error('Invalid Replicate API Token');
                const errorText = await response.text();
                throw new Error(`Replicate API Error: ${errorText}`);
            }

            const prediction = await response.json();
            const id = prediction.id;
            setStatusMessage(`Generation started (ID: ${id.slice(0, 8)}...). Polling...`);

            // 2. Poll for result
            let status = prediction.status;
            let videoUrl = null;

            while (status !== 'succeeded' && status !== 'failed' && status !== 'canceled') {
                await new Promise(r => setTimeout(r, 2000)); // Wait 2s

                const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
                    headers: {
                        'Authorization': `Token ${key}`,
                    }
                });

                if (!pollResponse.ok) throw new Error('Polling failed');

                const updatedPrediction = await pollResponse.json();
                status = updatedPrediction.status;

                if (status === 'succeeded') {
                    videoUrl = updatedPrediction.output;
                } else if (status === 'failed') {
                    throw new Error(updatedPrediction.error || 'Generation failed');
                } else {
                    setStatusMessage(`Processing... (${status})`);
                }
            }

            if (videoUrl) {
                setGeneratedVideo(videoUrl);
                setStatusMessage('Video generated successfully!');
                addToHistory({
                    type: 'video',
                    content: `Video from: ${prompt.slice(0, 30)}...`,
                    metadata: { url: videoUrl }
                });
            }

        } catch (err: any) {
            console.error('Video generation failed', err);
            setStatusMessage(`Error: ${err.message || 'Unknown error'}`);

            if (err.message.includes('Failed to fetch')) {
                setStatusMessage('Error: Browser blocked the request (CORS). Replicate requires a backend proxy.');
                alert('CORS Error: Replicate API cannot be called directly from the browser securely. In a real app, this requires a backend. For this playground, please use Simulation Mode.');
            }
        } finally {
            setIsVideoGenerating(false);
        }
    };

    return (
        <div className="image-gen-interface glass-panel">
            <div className="gen-controls">
                <div className="input-group">
                    <label>Prompt</label>
                    <div className="prompt-wrapper">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={`Describe the image (${tone} style)...`}
                            rows={3}
                        />
                        <button
                            className="magic-btn-overlay"
                            onClick={() => setShowPromptGen(true)}
                            title="Enhance Prompt"
                        >
                            ✨ Enhance
                        </button>
                    </div>
                </div>

                <div className="settings-row">
                    <div className="setting">
                        <label>Aspect Ratio</label>
                        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
                            <option value="1:1">1:1 (Square)</option>
                            <option value="16:9">16:9 (Landscape)</option>
                            <option value="21:9">21:9 (Cinematic)</option>
                            <option value="2.39:1">2.39:1 (Anamorphic)</option>
                            <option value="4:3">4:3 (Classic)</option>
                            <option value="9:16">9:16 (Mobile)</option>
                        </select>
                    </div>
                    <div className="setting">
                        <label>Style</label>
                        <select defaultValue={tone}>
                            <option>Photorealistic</option>
                            <option>Anime</option>
                            <option>3D Render</option>
                            <option>Oil Painting</option>
                            <option>{tone}</option>
                        </select>
                    </div>
                </div>

                <div className="settings-row advanced">
                    <div className="setting">
                        <label>Negative Prompt</label>
                        <input
                            type="text"
                            placeholder="blur, low quality, ugly..."
                            className="glass-input"
                        />
                    </div>
                    <div className="setting">
                        <label>Seed (Optional)</label>
                        <input
                            type="number"
                            placeholder="Random"
                            className="glass-input"
                        />
                    </div>
                </div>

                <div className="action-buttons">
                    <button
                        className="generate-btn"
                        onClick={handleGenerate}
                        disabled={isGenerating || isVideoGenerating}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Image'}
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        accept="image/*,video/*"
                        style={{ display: 'none' }}
                    />
                    <button
                        className="upload-btn"
                        onClick={triggerUpload}
                        disabled={isGenerating || isVideoGenerating}
                        title="Upload Image or Video"
                    >
                        📂 Upload
                    </button>
                </div>

                <div className="pro-actions">
                    <button
                        className="pro-btn video"
                        onClick={handleVideo}
                        disabled={!generatedImage || isVideoGenerating}
                    >
                        {isVideoGenerating ? '🎬 Generating Video...' : '🎬 Convert to Video (Pro)'}
                    </button>
                    {statusMessage && <p className="status-message">{statusMessage}</p>}
                </div>
            </div>

            <div className="gen-preview glass-panel">
                {generatedVideo === 'simulation' ? (
                    <div className="result-container">
                        <div className="simulated-video-container">
                            <img src={generatedImage!} alt="Simulated Video" className="generated-media ken-burns-effect" />
                            <div className="simulation-badge">▶ Simulated Preview</div>
                        </div>
                        <div className="result-actions">
                            <button className="download-btn" disabled title="Simulation only">
                                ⬇ Download Video (MP4)
                            </button>
                            <button className="share-btn" onClick={handleShare}>
                                🔗 Share
                            </button>
                        </div>
                    </div>
                ) : generatedVideo ? (
                    <div className="result-container">
                        <video
                            src={generatedVideo}
                            controls
                            autoPlay
                            loop
                            className="generated-media"
                        />
                        <div className="result-actions">
                            <button className="download-btn" onClick={handleDownload}>
                                ⬇ Download Video (MP4)
                            </button>
                            <button className="share-btn" onClick={handleShare}>
                                🔗 Share
                            </button>
                        </div>
                    </div>
                ) : generatedImage ? (
                    <div className="result-container">
                        <img src={generatedImage} alt="Generated result" className="generated-media" />
                        <div className="result-actions">
                            <button className="download-btn" onClick={handleDownload}>
                                ⬇ Download Image (PNG)
                            </button>
                            <button className="share-btn" onClick={handleShare}>
                                🔗 Share
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="placeholder-state">
                        <div className="placeholder-icon">🖼️</div>
                        <p>Enter a prompt or upload media</p>
                        {contextDescription && <p className="context-hint">Context: {contextDescription}</p>}
                    </div>
                )}
            </div>

            {showPromptGen && (
                <PromptGenerator
                    type="image"
                    basePrompt={prompt}
                    onClose={() => setShowPromptGen(false)}
                    onPromptGenerated={(newPrompt) => setPrompt(newPrompt)}
                />
            )}

            <ApiSettings
                isOpen={showApiSettings}
                onClose={() => setShowApiSettings(false)}
            />
        </div>
    );
};

export default ImageGenInterface;
