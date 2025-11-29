import React, { useState } from 'react';
import type { Scene } from './ScriptBoard';
import './AudioFactory.css';

interface AudioFactoryProps {
    scenes: Scene[];
    onComplete: (audioAssets: AudioAsset[]) => void;
}

export interface AudioAsset {
    sceneId: string;
    voiceoverUrl?: string;
    musicUrl?: string;
    status: 'pending' | 'generating' | 'completed';
    progress: number;
}

const AudioFactory: React.FC<AudioFactoryProps> = ({ scenes, onComplete }) => {
    const [audioAssets, setAudioAssets] = useState<AudioAsset[]>(
        scenes.map(s => ({ sceneId: s.id, status: 'pending', progress: 0 }))
    );
    const [selectedVoice, setSelectedVoice] = useState<'male' | 'female' | 'neutral'>('neutral');
    const [musicGenre, setMusicGenre] = useState<'upbeat' | 'cinematic' | 'ambient' | 'energetic'>('upbeat');
    const [isGenerating, setIsGenerating] = useState(false);

    /**
     * Generate voiceover using Web Speech API (free, built-in)
     * In production, this would use Bark TTS or Coqui TTS via HuggingFace
     */
    const generateVoiceover = async (sceneIndex: number) => {
        const scene = scenes[sceneIndex];

        // Update status
        setAudioAssets(prev => {
            const updated = [...prev];
            updated[sceneIndex].status = 'generating';
            return updated;
        });

        try {
            // Extract voiceover text from audio description
            const voiceoverText = scene.audio.replace(/Sound Effect:|Music:|Voiceover:/gi, '').trim();

            // Use Web Speech API for demo (free, instant)
            // In production: call Bark TTS or Coqui TTS API
            const utterance = new SpeechSynthesisUtterance(voiceoverText);
            const voices = speechSynthesis.getVoices();

            // Select voice based on preference
            const voiceFilter = selectedVoice === 'male' ? 'Male' :
                selectedVoice === 'female' ? 'Female' : '';
            const selectedVoiceObj = voices.find(v => v.name.includes(voiceFilter)) || voices[0];
            utterance.voice = selectedVoiceObj;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            // Simulate progress
            for (let i = 0; i <= 100; i += 20) {
                await new Promise(r => setTimeout(r, 200));
                setAudioAssets(prev => {
                    const updated = [...prev];
                    updated[sceneIndex].progress = i;
                    return updated;
                });
            }

            // In production, this would be a URL from Bark TTS
            // For now, we'll use a data URL placeholder
            const voiceoverUrl = `data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=`;

            setAudioAssets(prev => {
                const updated = [...prev];
                updated[sceneIndex].voiceoverUrl = voiceoverUrl;
                updated[sceneIndex].status = 'completed';
                updated[sceneIndex].progress = 100;
                return updated;
            });

            // Speak the text (demo only)
            speechSynthesis.speak(utterance);

        } catch (error) {
            console.error('Voiceover generation failed:', error);
            setAudioAssets(prev => {
                const updated = [...prev];
                updated[sceneIndex].status = 'pending';
                return updated;
            });
        }
    };

    /**
     * Generate background music
     * In production: use MusicGen via HuggingFace or Freesound.org API
     */
    const generateMusic = async () => {
        setIsGenerating(true);

        try {
            // Simulate music generation
            for (let i = 0; i < scenes.length; i++) {
                setAudioAssets(prev => {
                    const updated = [...prev];
                    updated[i].status = 'generating';
                    return updated;
                });

                // Simulate progress
                for (let p = 0; p <= 100; p += 25) {
                    await new Promise(r => setTimeout(r, 300));
                    setAudioAssets(prev => {
                        const updated = [...prev];
                        updated[i].progress = p;
                        return updated;
                    });
                }

                // In production: call MusicGen API with genre prompt
                // For now, use placeholder
                const musicUrl = `https://freesound.org/data/previews/placeholder-${musicGenre}.mp3`;

                setAudioAssets(prev => {
                    const updated = [...prev];
                    updated[i].musicUrl = musicUrl;
                    updated[i].status = 'completed';
                    updated[i].progress = 100;
                    return updated;
                });
            }

            setIsGenerating(false);
        } catch (error) {
            console.error('Music generation failed:', error);
            setIsGenerating(false);
        }
    };

    /**
     * Generate all audio (voiceover + music)
     */
    const generateAllAudio = async () => {
        setIsGenerating(true);

        // Generate voiceovers for all scenes
        for (let i = 0; i < scenes.length; i++) {
            await generateVoiceover(i);
        }

        // Generate background music
        await generateMusic();

        setIsGenerating(false);
    };

    const allComplete = audioAssets.every(a => a.status === 'completed');

    return (
        <div className="audio-factory">
            <div className="audio-header">
                <h2>🎙️ Audio Production Suite</h2>
                <p>Generate professional voiceover and music for your ad</p>
            </div>

            {/* Audio Settings */}
            <div className="audio-settings glass-panel">
                <div className="setting-group">
                    <label>Voiceover Voice</label>
                    <div className="voice-options">
                        <button
                            className={selectedVoice === 'male' ? 'active' : ''}
                            onClick={() => setSelectedVoice('male')}
                        >
                            🗣️ Male
                        </button>
                        <button
                            className={selectedVoice === 'female' ? 'active' : ''}
                            onClick={() => setSelectedVoice('female')}
                        >
                            🗣️ Female
                        </button>
                        <button
                            className={selectedVoice === 'neutral' ? 'active' : ''}
                            onClick={() => setSelectedVoice('neutral')}
                        >
                            🗣️ Neutral
                        </button>
                    </div>
                </div>

                <div className="setting-group">
                    <label>Music Genre</label>
                    <div className="music-options">
                        <button
                            className={musicGenre === 'upbeat' ? 'active' : ''}
                            onClick={() => setMusicGenre('upbeat')}
                        >
                            🎵 Upbeat
                        </button>
                        <button
                            className={musicGenre === 'cinematic' ? 'active' : ''}
                            onClick={() => setMusicGenre('cinematic')}
                        >
                            🎬 Cinematic
                        </button>
                        <button
                            className={musicGenre === 'ambient' ? 'active' : ''}
                            onClick={() => setMusicGenre('ambient')}
                        >
                            🌊 Ambient
                        </button>
                        <button
                            className={musicGenre === 'energetic' ? 'active' : ''}
                            onClick={() => setMusicGenre('energetic')}
                        >
                            ⚡ Energetic
                        </button>
                    </div>
                </div>

                <button
                    className="btn-generate-all"
                    onClick={generateAllAudio}
                    disabled={isGenerating}
                >
                    {isGenerating ? '🎵 Generating Audio...' : '🎙️ Generate All Audio'}
                </button>
            </div>

            {/* Audio Assets Grid */}
            <div className="audio-assets-grid">
                {scenes.map((scene, index) => {
                    const asset = audioAssets[index];
                    return (
                        <div key={scene.id} className={`audio-card ${asset.status}`}>
                            <div className="audio-card-header">
                                <h3>Scene {scene.number}</h3>
                                <span className="status-badge">{asset.status}</span>
                            </div>

                            <div className="audio-content">
                                <div className="audio-text">
                                    <strong>Audio:</strong>
                                    <p>{scene.audio}</p>
                                </div>

                                {asset.status === 'generating' && (
                                    <div className="audio-progress">
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${asset.progress}%` }}
                                            />
                                        </div>
                                        <span>{asset.progress}%</span>
                                    </div>
                                )}

                                {asset.status === 'completed' && (
                                    <div className="audio-controls">
                                        <div className="audio-track">
                                            <span>🎙️ Voiceover</span>
                                            <button
                                                className="btn-play-small"
                                                onClick={() => generateVoiceover(index)}
                                            >
                                                ▶ Preview
                                            </button>
                                        </div>
                                        <div className="audio-track">
                                            <span>🎵 Music</span>
                                            <span className="music-genre-tag">{musicGenre}</span>
                                        </div>
                                    </div>
                                )}

                                {asset.status === 'pending' && (
                                    <button
                                        className="btn-generate-scene"
                                        onClick={() => generateVoiceover(index)}
                                    >
                                        Generate Audio
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Continue Button */}
            <div className="audio-actions">
                <button
                    className="btn-continue"
                    disabled={!allComplete}
                    onClick={() => onComplete(audioAssets)}
                >
                    {allComplete ? 'Continue to Timeline Editor →' : 'Generate Audio to Continue'}
                </button>
            </div>

            {/* Info Panel */}
            <div className="audio-info glass-panel">
                <h4>🎵 Audio Production Info</h4>
                <ul>
                    <li><strong>Voiceover:</strong> Uses Web Speech API (demo) - In production: Bark TTS or Coqui TTS</li>
                    <li><strong>Music:</strong> Placeholder - In production: MusicGen via HuggingFace</li>
                    <li><strong>Quality:</strong> Professional-grade AI voices with natural intonation</li>
                    <li><strong>Cost:</strong> $0.00 (100% free AI models)</li>
                </ul>
            </div>
        </div>
    );
};

export default AudioFactory;
