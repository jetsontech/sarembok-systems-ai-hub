import React, { useState, useCallback } from 'react';
import type { Scene } from './ScriptBoard';
import { aiOrchestrator } from '../../services/ai-orchestrator';
import './AssetFactory.css';

interface AssetFactoryProps {
    scenes: Scene[];
    onComplete: (assets: GeneratedAsset[]) => void;
}

export interface GeneratedAsset {
    sceneId: string;
    videoUrl?: string;
    audioUrl?: string;
    status: 'pending' | 'generating' | 'completed' | 'failed';
    progress: number;
    isCustomUpload?: boolean;
}

const AssetFactory: React.FC<AssetFactoryProps> = ({ scenes, onComplete }) => {
    const [assets, setAssets] = useState<GeneratedAsset[]>(
        scenes.map(s => ({ sceneId: s.id, status: 'pending', progress: 0 }))
    );
    const [uploadMode, setUploadMode] = useState(false);

    /**
     * Handle custom video/image upload
     */
    const handleFileUpload = useCallback((sceneIndex: number, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setAssets(prev => {
                const updated = [...prev];
                updated[sceneIndex] = {
                    ...updated[sceneIndex],
                    videoUrl: dataUrl,
                    status: 'completed',
                    progress: 100,
                    isCustomUpload: true
                };
                return updated;
            });
        };
        reader.readAsDataURL(file);
    }, []);

    /**
     * Upscale image using AI
     */
    const handleUpscale = async (sceneIndex: number) => {
        const asset = assets[sceneIndex];
        if (!asset.videoUrl) return;

        setAssets(prev => {
            const updated = [...prev];
            updated[sceneIndex].status = 'generating';
            updated[sceneIndex].progress = 0;
            return updated;
        });

        try {
            // Simulate upscaling progress
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(r => setTimeout(r, 200));
                setAssets(prev => {
                    const updated = [...prev];
                    updated[sceneIndex].progress = i;
                    return updated;
                });
            }

            // In production, this would call Real-ESRGAN via HuggingFace
            // For now, we'll use a higher resolution version
            const upscaledUrl = asset.videoUrl.replace(/width=\d+&height=\d+/, 'width=3840&height=2160');

            setAssets(prev => {
                const updated = [...prev];
                updated[sceneIndex].videoUrl = upscaledUrl;
                updated[sceneIndex].status = 'completed';
                updated[sceneIndex].progress = 100;
                return updated;
            });
        } catch (error) {
            console.error('Upscaling failed:', error);
            setAssets(prev => {
                const updated = [...prev];
                updated[sceneIndex].status = 'failed';
                return updated;
            });
        }
    };

    React.useEffect(() => {
        // AI-powered asset generation (only if not in upload mode)
        if (uploadMode) return;

        const generateAssets = async () => {
            const newAssets = [...assets];

            for (let i = 0; i < newAssets.length; i++) {
                if (newAssets[i].isCustomUpload) continue; // Skip uploaded assets

                newAssets[i].status = 'generating';
                setAssets([...newAssets]);

                try {
                    const scene = scenes[i];
                    const imagePrompt = `${scene.visual}, cinematic lighting, professional advertising photography, 8k resolution, ultra detailed, award-winning commercial`;

                    const result = await aiOrchestrator.generateImage(imagePrompt, { seed: Date.now() + i });

                    for (let step = 0; step <= 10; step++) {
                        await new Promise(r => setTimeout(r, 200));
                        newAssets[i].progress = (step / 10) * 100;
                        setAssets([...newAssets]);
                    }

                    if (result.success) {
                        newAssets[i].status = 'completed';
                        newAssets[i].videoUrl = result.data;
                        newAssets[i].audioUrl = `https://replicate.delivery/pbxt/mock-audio-${i}.mp3`;
                    } else {
                        newAssets[i].status = 'failed';
                        console.error(`Asset generation failed for scene ${i + 1}:`, result.error);
                    }
                } catch (error) {
                    console.error(`Error generating asset for scene ${i + 1}:`, error);
                    newAssets[i].status = 'failed';
                }

                setAssets([...newAssets]);
            }
        };

        if (assets.some(a => a.status === 'pending' && !a.isCustomUpload)) {
            generateAssets();
        }
    }, [uploadMode]);

    return (
        <div className="asset-factory">
            <div className="factory-header">
                <h2>Asset Factory</h2>
                <p>Generating high-fidelity assets for {scenes.length} scenes...</p>
                <div className="factory-mode-toggle">
                    <button
                        className={!uploadMode ? 'active' : ''}
                        onClick={() => setUploadMode(false)}
                    >
                        🤖 AI Generate
                    </button>
                    <button
                        className={uploadMode ? 'active' : ''}
                        onClick={() => setUploadMode(true)}
                    >
                        📁 Upload Custom
                    </button>
                </div>
            </div>

            <div className="assets-grid">
                {scenes.map((scene, index) => {
                    const asset = assets.find(a => a.sceneId === scene.id);
                    return (
                        <div key={scene.id} className={`asset-card ${asset?.status}`}>
                            <div className="asset-preview">
                                {asset?.status === 'completed' && asset.videoUrl ? (
                                    <div className="preview-image-container">
                                        <img
                                            src={asset.videoUrl}
                                            alt={`Scene ${scene.number}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div className="preview-actions">
                                            <button
                                                className="btn-upscale"
                                                onClick={() => handleUpscale(index)}
                                                title="Upscale to 4K"
                                            >
                                                ⬆️ 4K
                                            </button>
                                            {asset.isCustomUpload && (
                                                <span className="custom-badge">Custom</span>
                                            )}
                                        </div>
                                    </div>
                                ) : asset?.status === 'generating' ? (
                                    <div className="generating-loader">
                                        <div className="spinner-small"></div>
                                        <span>{Math.round(asset?.progress || 0)}%</span>
                                    </div>
                                ) : (
                                    <div className="upload-zone">
                                        <input
                                            type="file"
                                            accept="image/*,video/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleFileUpload(index, file);
                                            }}
                                            style={{ display: 'none' }}
                                            id={`upload-${scene.id}`}
                                        />
                                        <label htmlFor={`upload-${scene.id}`} className="upload-label">
                                            📤 Upload Video/Image
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="asset-info">
                                <h4>Scene {scene.number}</h4>
                                <p className="visual-desc">{scene.visual}</p>
                                <div className="status-badge">{asset?.status}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="factory-actions">
                <button
                    className="btn-next"
                    disabled={!assets.every(a => a.status === 'completed')}
                    onClick={() => onComplete(assets)}
                >
                    {assets.every(a => a.status === 'completed') ? 'Enter Studio Editor →' : 'Generating Assets...'}
                </button>
            </div>
        </div>
    );
};

export default AssetFactory;
