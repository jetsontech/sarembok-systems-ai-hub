import React, { useState, useRef } from 'react';
import { Upload, Code, Video, Music, FileText, Download, Trash2, Play } from 'lucide-react';
import './ContextSidebar.css';

interface MediaItem {
    id: string;
    type: 'code' | 'video' | 'audio' | 'text';
    name: string;
    content: string | File;
    timestamp: Date;
}

const ContextSidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'input' | 'output'>('output');
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [codeInput, setCodeInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const type = file.type.startsWith('video/') ? 'video' :
                file.type.startsWith('audio/') ? 'audio' :
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
            default: return <FileText size={20} />;
        }
    };

    return (
        <>
            <button
                className={`context-toggle glass-panel ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Media Panel"
            >
                📁
            </button>

            <div className={`context-sidebar glass-panel ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Media Panel</h3>
                    <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                </div>

                <div className="sidebar-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'input' ? 'active' : ''}`}
                        onClick={() => setActiveTab('input')}
                    >
                        <Upload size={16} /> Input
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'output' ? 'active' : ''}`}
                        onClick={() => setActiveTab('output')}
                    >
                        <Download size={16} /> Output
                    </button>
                </div>

                <div className="sidebar-content">
                    {activeTab === 'input' && (
                        <div className="input-section">
                            <div className="upload-area">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="video/*,audio/*,.js,.ts,.py,.txt,.json,.html,.css"
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
                                    <Code size={16} /> Code Editor
                                </label>
                                <textarea
                                    value={codeInput}
                                    onChange={(e) => setCodeInput(e.target.value)}
                                    placeholder="Paste or write code here..."
                                    className="code-textarea"
                                    rows={10}
                                />
                                <button
                                    className="save-code-btn"
                                    onClick={handleCodeSave}
                                    disabled={!codeInput.trim()}
                                >
                                    Save Code
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'output' && (
                        <div className="output-section">
                            {mediaItems.length === 0 ? (
                                <div className="empty-state">
                                    <FileText size={48} opacity={0.3} />
                                    <p>No media yet</p>
                                    <small>Upload or generate content</small>
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
                                                {item.type === 'video' && typeof item.content !== 'string' && (
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
        </>
    );
};

export default ContextSidebar;
