import React, { useState, useRef } from 'react';
import { Upload, Code, Video, Music, FileText, Download, Trash2, Play, Zap, Image as ImageIcon } from 'lucide-react';
import './MediaPanel.css';

export interface MediaItem {
    id: string;
    type: 'code' | 'video' | 'audio' | 'text' | 'image';
    name: string;
    content: string | File;
    timestamp: Date;
}

interface MediaPanelProps {
    mediaItems: MediaItem[];
    setMediaItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
}

const MediaPanel: React.FC<MediaPanelProps> = ({ mediaItems, setMediaItems }) => {
    const [activeTab, setActiveTab] = useState<'input' | 'output'>('output');
    const [codeInput, setCodeInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const type = file.type.startsWith('video/') ? 'video' :
                file.type.startsWith('audio/') ? 'audio' :
                    file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('text/') || file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.py') ? 'code' :
                            'text';

            const newItem: MediaItem = {
                id: Date.now().toString() + Math.random(),
                type,
                name: file.name,
                content: file,
                timestamp: new Date()
            };

            setMediaItems(prev => [newItem, ...prev]);
        });
    };

    const handleCodeSave = () => {
        if (!codeInput.trim()) return;

        const newItem: MediaItem = {
            id: Date.now().toString(),
            type: 'code',
            name: `Code_${new Date().toLocaleTimeString()}.txt`,
            content: codeInput,
            timestamp: new Date()
        };

        setMediaItems(prev => [newItem, ...prev]);
        setCodeInput('');
        setActiveTab('output');
    };

    const downloadItem = (item: MediaItem) => {
        if (typeof item.content === 'string') {
            const blob = new Blob([item.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.name;
            a.click();
            URL.revokeObjectURL(url);
        } else {
            const url = URL.createObjectURL(item.content);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.name;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const removeItem = (id: string) => {
        setMediaItems(prev => prev.filter(item => item.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'code': return <Code size={20} />;
            case 'video': return <Video size={20} />;
            case 'audio': return <Music size={20} />;
            case 'image': return <ImageIcon size={20} />;
            default: return <FileText size={20} />;
        }
    };

    return (
        <div className="media-panel-container">
            <div className="panel-header">
                <div className="panel-title">
                    <Zap size={16} />
                    <span>Media Hub</span>
                </div>
            </div>

            <div className="media-tabs">
                <button
                    className={`media-tab ${activeTab === 'input' ? 'active' : ''}`}
                    onClick={() => setActiveTab('input')}
                >
                    <Upload size={14} /> Input
                </button>
                <button
                    className={`media-tab ${activeTab === 'output' ? 'active' : ''}`}
                    onClick={() => setActiveTab('output')}
                >
                    <Download size={14} /> Output
                </button>
            </div>

            <div className="media-content">
                {activeTab === 'input' && (
                    <div className="input-section fade-in">
                        <div className="upload-area">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="video/*,audio/*,image/*,.js,.ts,.py,.txt,.json,.html,.css"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                            <button
                                className="upload-btn"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={24} />
                                <span>Upload Media</span>
                                <small>Video, Audio, Code</small>
                            </button>
                        </div>

                        <div className="code-editor">
                            <label className="editor-label">
                                <Code size={14} /> Code Editor
                            </label>
                            <textarea
                                value={codeInput}
                                onChange={(e) => setCodeInput(e.target.value)}
                                placeholder="Paste or write code here..."
                                className="code-textarea"
                                rows={8}
                            />
                            <button
                                className="save-code-btn"
                                onClick={handleCodeSave}
                                disabled={!codeInput.trim()}
                            >
                                Save to Output
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'output' && (
                    <div className="output-section fade-in">
                        {mediaItems.length === 0 ? (
                            <div className="empty-state">
                                <FileText size={40} opacity={0.3} />
                                <p>No media yet</p>
                                <small>Upload or generate content to see it here</small>
                            </div>
                        ) : (
                            <div className="media-list">
                                {mediaItems.map(item => (
                                    <div key={item.id} className="media-item">
                                        <div className="media-icon">
                                            {getIcon(item.type)}
                                        </div>
                                        <div className="media-info">
                                            <div className="media-name">{item.name}</div>
                                            <div className="media-time">
                                                {item.timestamp.toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className="media-actions">
                                            {(item.type === 'video' || item.type === 'image') && typeof item.content !== 'string' && (
                                                <button
                                                    className="action-btn"
                                                    onClick={() => {
                                                        const url = URL.createObjectURL(item.content as File);
                                                        window.open(url, '_blank');
                                                    }}
                                                    title="Preview"
                                                >
                                                    <Play size={14} />
                                                </button>
                                            )}
                                            <button
                                                className="action-btn"
                                                onClick={() => downloadItem(item)}
                                                title="Download"
                                            >
                                                <Download size={14} />
                                            </button>
                                            <button
                                                className="action-btn danger"
                                                onClick={() => removeItem(item.id)}
                                                title="Remove"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaPanel;
