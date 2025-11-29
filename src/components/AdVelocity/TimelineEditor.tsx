import React, { useState, useRef, useEffect } from 'react';
import type { GeneratedAsset } from './AssetFactory';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import './TimelineEditor.css';

interface TimelineEditorProps {
    assets: GeneratedAsset[];
}

interface TimelineClip {
    id: string;
    assetIndex: number;
    startTime: number;
    duration: number;
    transition?: 'none' | 'crossfade' | 'wipe' | 'zoom';
    textOverlay?: {
        text: string;
        position: 'top' | 'center' | 'bottom';
        style: 'default' | 'bold' | 'outline';
    };
    colorGrade?: 'none' | 'cinematic' | 'vibrant' | 'vintage' | 'bw';
}

const TimelineEditor: React.FC<TimelineEditorProps> = ({ assets }) => {
    const [clips, setClips] = useState<TimelineClip[]>(
        assets.map((_, index) => ({
            id: `clip-${index}`,
            assetIndex: index,
            startTime: index * 5,
            duration: 5,
            transition: 'crossfade' as const,
            colorGrade: 'none' as const
        }))
    );

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [draggedClip, setDraggedClip] = useState<string | null>(null);

    const ffmpegRef = useRef(new FFmpeg());

    // Initialize FFmpeg
    useEffect(() => {
        const loadFFmpeg = async () => {
            const ffmpeg = ffmpegRef.current;
            if (!ffmpeg.loaded) {
                await ffmpeg.load();
            }
        };
        loadFFmpeg();
    }, []);

    // Playback simulation
    useEffect(() => {
        let interval: number;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentTime(prev => {
                    const totalDuration = clips.reduce((sum, clip) => Math.max(sum, clip.startTime + clip.duration), 0);
                    if (prev >= totalDuration) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev + 0.1;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, clips]);

    // Get current clip being played
    const getCurrentClip = () => {
        return clips.find(clip =>
            currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration
        );
    };

    // Drag and drop handlers
    const handleDragStart = (clipId: string) => {
        setDraggedClip(clipId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (targetClipId: string) => {
        if (!draggedClip || draggedClip === targetClipId) return;

        const draggedIndex = clips.findIndex(c => c.id === draggedClip);
        const targetIndex = clips.findIndex(c => c.id === targetClipId);

        const newClips = [...clips];
        const [removed] = newClips.splice(draggedIndex, 1);
        newClips.splice(targetIndex, 0, removed);

        // Recalculate start times
        let currentStart = 0;
        newClips.forEach(clip => {
            clip.startTime = currentStart;
            currentStart += clip.duration;
        });

        setClips(newClips);
        setDraggedClip(null);
    };

    // Update clip properties
    const updateClip = (clipId: string, updates: Partial<TimelineClip>) => {
        setClips(prev => prev.map(clip =>
            clip.id === clipId ? { ...clip, ...updates } : clip
        ));
    };

    // Add text overlay
    const addTextOverlay = (clipId: string) => {
        const text = prompt('Enter text overlay:');
        if (text) {
            updateClip(clipId, {
                textOverlay: {
                    text,
                    position: 'bottom',
                    style: 'default'
                }
            });
        }
    };

    // Export video
    const exportVideo = async () => {
        setIsExporting(true);
        setExportProgress(0);

        try {
            const ffmpeg = ffmpegRef.current;

            // Download all assets
            for (let i = 0; i < assets.length; i++) {
                const asset = assets[i];
                if (asset.videoUrl) {
                    setExportProgress((i / assets.length) * 30);
                    const data = await fetchFile(asset.videoUrl);
                    await ffmpeg.writeFile(`input${i}.jpg`, data);
                }
            }

            setExportProgress(40);

            // Create video from images with transitions
            const filterComplex = clips.map((clip, index) => {
                let filter = `[${index}:v]`;

                // Apply color grading
                if (clip.colorGrade && clip.colorGrade !== 'none') {
                    const gradeFilters = {
                        cinematic: 'curves=vintage',
                        vibrant: 'eq=saturation=1.5:contrast=1.2',
                        vintage: 'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131',
                        bw: 'hue=s=0'
                    };
                    filter += gradeFilters[clip.colorGrade] + ',';
                }

                // Add text overlay
                if (clip.textOverlay) {
                    const yPos = clip.textOverlay.position === 'top' ? '50' :
                        clip.textOverlay.position === 'center' ? 'h/2' : 'h-50';
                    filter += `drawtext=text='${clip.textOverlay.text}':x=(w-text_w)/2:y=${yPos}:fontsize=48:fontcolor=white,`;
                }

                filter += `scale=1920:1080,setsar=1,fps=30,format=yuv420p[v${index}]`;
                return filter;
            }).join(';');

            setExportProgress(60);

            // Concatenate clips with transitions
            const concatInputs = clips.map((_, i) => `[v${i}]`).join('');
            const concatFilter = `${concatInputs}concat=n=${clips.length}:v=1:a=0[outv]`;

            await ffmpeg.exec([
                ...clips.flatMap((clip) => ['-loop', '1', '-t', clip.duration.toString(), '-i', `input${clip.assetIndex}.jpg`]),
                '-filter_complex', `${filterComplex};${concatFilter}`,
                '-map', '[outv]',
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '23',
                '-movflags', '+faststart',
                'output.mp4'
            ]);

            setExportProgress(90);

            // Download the result
            const data = await ffmpeg.readFile('output.mp4');
            const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'advelocity-export.mp4';
            a.click();

            setExportProgress(100);
            setTimeout(() => {
                setIsExporting(false);
                setExportProgress(0);
            }, 1000);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
            setIsExporting(false);
            setExportProgress(0);
        }
    };

    const selectedClip = clips.find(c => c.id === selectedClipId);
    const currentClip = getCurrentClip();
    const totalDuration = clips.reduce((sum, clip) => Math.max(sum, clip.startTime + clip.duration), 0);

    return (
        <div className="timeline-editor">
            {/* Preview Monitor */}
            <div className="editor-main">
                <div className="preview-monitor glass-panel">
                    <div className="monitor-screen">
                        {currentClip && assets[currentClip.assetIndex]?.videoUrl ? (
                            <div
                                className="preview-content"
                                style={{
                                    backgroundImage: `url(${assets[currentClip.assetIndex].videoUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    filter: currentClip.colorGrade && currentClip.colorGrade !== 'none'
                                        ? getColorGradeCSS(currentClip.colorGrade)
                                        : 'none'
                                }}
                            >
                                {currentClip.textOverlay && (
                                    <div className={`text-overlay ${currentClip.textOverlay.position} ${currentClip.textOverlay.style}`}>
                                        {currentClip.textOverlay.text}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="placeholder-player">
                                <div className="play-icon">▶</div>
                                <p>Preview</p>
                            </div>
                        )}
                    </div>

                    <div className="monitor-controls">
                        <button className="control-btn" onClick={() => setIsPlaying(!isPlaying)}>
                            {isPlaying ? '⏸ Pause' : '▶ Play'}
                        </button>
                        <div className="time-display">
                            {formatTime(currentTime)} / {formatTime(totalDuration)}
                        </div>
                    </div>
                </div>

                {/* Properties Panel */}
                {selectedClip && (
                    <div className="properties-panel glass-panel">
                        <h3>Clip Properties</h3>

                        <div className="property-group">
                            <label>Duration (seconds)</label>
                            <input
                                type="number"
                                value={selectedClip.duration}
                                onChange={(e) => updateClip(selectedClip.id, { duration: parseFloat(e.target.value) })}
                                min="1"
                                max="30"
                                step="0.5"
                            />
                        </div>

                        <div className="property-group">
                            <label>Transition</label>
                            <select
                                value={selectedClip.transition}
                                onChange={(e) => updateClip(selectedClip.id, { transition: e.target.value as any })}
                            >
                                <option value="none">None</option>
                                <option value="crossfade">Crossfade</option>
                                <option value="wipe">Wipe</option>
                                <option value="zoom">Zoom</option>
                            </select>
                        </div>

                        <div className="property-group">
                            <label>Color Grade</label>
                            <select
                                value={selectedClip.colorGrade}
                                onChange={(e) => updateClip(selectedClip.id, { colorGrade: e.target.value as any })}
                            >
                                <option value="none">None</option>
                                <option value="cinematic">Cinematic</option>
                                <option value="vibrant">Vibrant</option>
                                <option value="vintage">Vintage</option>
                                <option value="bw">Black & White</option>
                            </select>
                        </div>

                        <button className="btn-add-text" onClick={() => addTextOverlay(selectedClip.id)}>
                            + Add Text Overlay
                        </button>
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div className="timeline-panel glass-panel">
                <div className="timeline-header">
                    <h3>Timeline</h3>
                    <div className="timeline-zoom">
                        <button>-</button>
                        <span>100%</span>
                        <button>+</button>
                    </div>
                </div>

                <div className="timeline-tracks">
                    <div className="track-labels">
                        <div className="track-label">Video</div>
                    </div>

                    <div className="track-content">
                        <div className="video-track">
                            {clips.map((clip) => (
                                <div
                                    key={clip.id}
                                    className={`timeline-clip ${selectedClipId === clip.id ? 'selected' : ''}`}
                                    style={{
                                        left: `${(clip.startTime / totalDuration) * 100}%`,
                                        width: `${(clip.duration / totalDuration) * 100}%`
                                    }}
                                    draggable
                                    onDragStart={() => handleDragStart(clip.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(clip.id)}
                                    onClick={() => setSelectedClipId(clip.id)}
                                >
                                    <div className="clip-thumbnail">
                                        {assets[clip.assetIndex]?.videoUrl && (
                                            <img src={assets[clip.assetIndex].videoUrl} alt={`Clip ${clip.assetIndex + 1}`} />
                                        )}
                                    </div>
                                    <div className="clip-label">Scene {clip.assetIndex + 1}</div>
                                    {clip.transition && clip.transition !== 'none' && (
                                        <div className="transition-indicator">{clip.transition}</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Playhead */}
                        <div
                            className="playhead"
                            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Export */}
            <div className="editor-actions">
                <button
                    className="btn-export"
                    onClick={exportVideo}
                    disabled={isExporting}
                >
                    {isExporting ? `Exporting... ${exportProgress}%` : '🎬 Export Video (MP4)'}
                </button>
            </div>

            {/* Export Progress Modal */}
            {isExporting && (
                <div className="export-modal">
                    <div className="export-modal-content">
                        <h3>Exporting Your Ad</h3>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${exportProgress}%` }} />
                        </div>
                        <p>{exportProgress}% Complete</p>
                        <small>Processing with FFmpeg.wasm...</small>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper functions
function getColorGradeCSS(grade: string): string {
    const grades = {
        cinematic: 'sepia(0.3) contrast(1.1) brightness(0.95)',
        vibrant: 'saturate(1.5) contrast(1.2)',
        vintage: 'sepia(0.5) contrast(0.9) brightness(1.1)',
        bw: 'grayscale(1) contrast(1.1)'
    };
    return grades[grade as keyof typeof grades] || 'none';
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default TimelineEditor;
