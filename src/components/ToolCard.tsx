import React from 'react';
import { Link } from 'react-router-dom';
import './ToolCard.css';

export interface Tool {
    id: string;
    name: string;
    description: string;
    category: 'model' | 'app' | 'workflow' | '3D & Production';
    tags: string[];
    link?: string;
    actionLink?: string;
    isNew?: boolean;
    icon?: string;
}

interface ToolCardProps {
    tool: Tool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    return (
        <Link to={`/tool/${tool.id}`} className="tool-card glass-panel">
            <div className="tool-header">
                <h3 className="tool-name">{tool.name}</h3>
                {tool.isNew && <span className="badge-new">NEW</span>}
            </div>
            <p className="tool-description">{tool.description}</p>
            <div className="tool-tags">
                {tool.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                ))}
            </div>
            <div className="tool-footer">
                <span className="tool-action">Launch App <span className="arrow">→</span></span>
            </div>
        </Link>
    );
};

export default ToolCard;
