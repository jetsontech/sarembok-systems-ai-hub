import React from 'react';
import { useHistory } from '../context/HistoryContext';
import './HistorySidebar.css';

const HistorySidebar: React.FC = () => {
    const { history, isOpen, toggleHistory, clearHistory } = useHistory();

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'chat': return '💬';
            case 'image': return '🖼️';
            case 'video': return '🎬';
            case 'scene': return '🧊';
            default: return '📝';
        }
    };

    return (
        <div className={`history-sidebar ${isOpen ? 'open' : ''}`}>
            <button className="history-toggle-btn" onClick={toggleHistory} title="Toggle History">
                {isOpen ? '›' : '‹'}
            </button>

            <div className="history-header">
                <h3>History Log</h3>
                {history.length > 0 && (
                    <button className="clear-btn" onClick={clearHistory}>Clear All</button>
                )}
            </div>

            <div className="history-list">
                {history.length === 0 ? (
                    <div className="empty-state">
                        No actions recorded yet.<br />
                        Start creating!
                    </div>
                ) : (
                    history.map((item) => (
                        <div key={item.id} className="history-item">
                            <div className="item-header">
                                <span className="item-type">{getIcon(item.type)} {item.type}</span>
                                <span className="item-time">{formatDate(item.timestamp)}</span>
                            </div>
                            <div className="item-content">
                                {item.type === 'image' || item.type === 'video' ? (
                                    <>
                                        <div>{item.content}</div>
                                        {item.metadata?.url && (
                                            <div className="item-preview">
                                                <img src={item.metadata.url} alt="History preview" />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    item.content
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistorySidebar;
