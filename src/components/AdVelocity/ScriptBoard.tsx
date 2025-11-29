import React, { useState, useEffect } from 'react';
import type { CampaignData } from './AdVelocity';
import { aiOrchestrator } from '../../services/ai-orchestrator';
import './ScriptBoard.css';

interface ScriptBoardProps {
    campaignData: CampaignData;
    onComplete: (scenes: Scene[]) => void;
    onBack: () => void;
}

export interface Scene {
    id: string;
    number: number;
    visual: string;
    audio: string;
    duration: number; // seconds
}

const ScriptBoard: React.FC<ScriptBoardProps> = ({ campaignData, onComplete, onBack }) => {
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [isGenerating, setIsGenerating] = useState(true);
    const [generationStatus, setGenerationStatus] = useState('Analyzing campaign brief...');
    const [usedModel, setUsedModel] = useState<string>('');

    // AI-Powered Script Generation
    useEffect(() => {
        const generateScript = async () => {
            try {
                setGenerationStatus('Consulting creative AI director...');

                // Generate script using AI orchestrator
                const result = await aiOrchestrator.generateScript(campaignData);

                if (!result.success) {
                    console.error('AI generation failed:', result.error);
                    // Fallback to template-based generation
                    setGenerationStatus('Using creative templates...');
                    const fallbackScenes = generateFallbackScript(campaignData);
                    setScenes(fallbackScenes);
                    setUsedModel('Template');
                    setIsGenerating(false);
                    return;
                }

                setUsedModel(result.model);
                setGenerationStatus('Parsing creative vision...');

                // Parse AI response into scenes
                const parsedScenes = parseAIScript(result.data, campaignData);
                setScenes(parsedScenes);
                setIsGenerating(false);

            } catch (error) {
                console.error('Script generation error:', error);
                // Fallback to template
                const fallbackScenes = generateFallbackScript(campaignData);
                setScenes(fallbackScenes);
                setUsedModel('Template (Fallback)');
                setIsGenerating(false);
            }
        };

        generateScript();
    }, [campaignData]);


    /**
     * Parse AI-generated script into scene objects
     */
    const parseAIScript = (aiResponse: string, campaign: CampaignData): Scene[] => {
        try {
            // Try to extract structured scenes from AI response
            const sceneMatches = aiResponse.match(/Scene \d+[\s\S]*?(?=Scene \d+|$)/gi);

            if (sceneMatches && sceneMatches.length > 0) {
                return sceneMatches.map((sceneText, index) => {
                    const visualMatch = sceneText.match(/Visual[:\s]+(.*?)(?=Audio|Duration|$)/is);
                    const audioMatch = sceneText.match(/Audio[:\s]+(.*?)(?=Duration|$)/is);
                    const durationMatch = sceneText.match(/Duration[:\s]+(\d+)/i);

                    return {
                        id: String(index + 1),
                        number: index + 1,
                        visual: visualMatch?.[1]?.trim() || `Scene ${index + 1} visual`,
                        audio: audioMatch?.[1]?.trim() || `Scene ${index + 1} audio`,
                        duration: durationMatch ? parseInt(durationMatch[1]) : 4
                    };
                });
            }
        } catch (error) {
            console.error('Error parsing AI script:', error);
        }

        // Fallback if parsing fails
        return generateFallbackScript(campaign);
    };

    /**
     * Generate fallback script using templates
     */
    const generateFallbackScript = (campaign: CampaignData): Scene[] => {
        return [
            {
                id: '1',
                number: 1,
                visual: `Opening shot: High-energy montage of ${campaign.productName} being opened. Fast cuts, vibrant colors.`,
                audio: `Sound Effect: Crisp can opening sound. Music: Upbeat ${campaign.mood} track starts.`,
                duration: 3
            },
            {
                id: '2',
                number: 2,
                visual: `Close up: The product glowing with energy. Background matches the ${campaign.mood} vibe.`,
                audio: `Voiceover: "Unleash the power within."`,
                duration: 4
            },
            {
                id: '3',
                number: 3,
                visual: `Lifestyle shot: ${campaign.audience} enjoying the product in a social setting.`,
                audio: `Voiceover: "Fuel your passion." Music swells.`,
                duration: 5
            },
            {
                id: '4',
                number: 4,
                visual: `End card: Logo animation and Call to Action. URL: ${campaign.productUrl || 'Link in bio'}.`,
                audio: `Voiceover: "${campaign.productName}. Get yours today."`,
                duration: 3
            }
        ];
    };

    const handleSceneChange = (id: string, field: keyof Scene, value: string | number) => {
        setScenes(prev => prev.map(scene =>
            scene.id === id ? { ...scene, [field]: value } : scene
        ));
    };

    return (
        <div className="script-board">
            <div className="board-header">
                <button onClick={onBack} className="btn-back">← Back</button>
                <h2>AI Script Engine</h2>
                <div className="campaign-summary">
                    <span>{campaignData.productName}</span> • <span>{campaignData.platform}</span>
                    {usedModel && <span className="model-badge"> • {usedModel}</span>}
                </div>
            </div>

            {isGenerating ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>{generationStatus}</p>
                    <small style={{ marginTop: '8px', opacity: 0.7 }}>Powered by free AI models</small>
                </div>
            ) : (
                <div className="scenes-container">
                    {scenes.map((scene) => (
                        <div key={scene.id} className="scene-card glass-panel">
                            <div className="scene-number">Scene {scene.number}</div>

                            <div className="scene-input-group">
                                <label>Visual Description</label>
                                <textarea
                                    value={scene.visual}
                                    onChange={(e) => handleSceneChange(scene.id, 'visual', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="scene-input-group">
                                <label>Audio / Voiceover</label>
                                <textarea
                                    value={scene.audio}
                                    onChange={(e) => handleSceneChange(scene.id, 'audio', e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div className="scene-meta">
                                <label>Duration (s):</label>
                                <input
                                    type="number"
                                    value={scene.duration}
                                    onChange={(e) => handleSceneChange(scene.id, 'duration', parseInt(e.target.value))}
                                    min={1}
                                    max={60}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="board-actions">
                        <button className="btn-add-scene" onClick={() => setScenes(prev => [...prev, {
                            id: Date.now().toString(),
                            number: prev.length + 1,
                            visual: '',
                            audio: '',
                            duration: 3
                        }])}>+ Add Scene</button>

                        <button className="btn-next" onClick={() => onComplete(scenes)}>
                            Generate Assets →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScriptBoard;
