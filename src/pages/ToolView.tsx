import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { tools } from '../data/tools';
import ChatInterface from '../components/ChatInterface';
import ImageGenInterface from '../components/ImageGenInterface';
import SceneGenInterface from '../components/SceneGenInterface';
import OpenUSDNexusInterface from '../components/OpenUSDNexusInterface';
import ReplicateStudio from '../components/ReplicateStudio';
import AdVelocity from '../components/AdVelocity/AdVelocity';
import JuneteenthEditor from '../components/JuneteenthEditor';
import Nexus365 from '../components/Nexus365';
import AgentPlayground from './AgentPlayground';
import './ToolView.css';

const ToolView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const tool = tools.find(t => t.id === id);

    if (!tool) {
        return <div className="p-10 text-center">Tool not found</div>;
    }

    return (
        <div className="tool-view-page">
            <div className="tool-header glass-panel">
                <Link to="/" className="back-link">← Back to Hub</Link>
                <div className="tool-info">
                    <h1>{tool.icon} {tool.name}</h1>
                    <p>{tool.description}</p>
                </div>
            </div>

            <div className="tool-content">
                {tool.category === 'model' ? (
                    <ChatInterface />
                ) : tool.tags.includes('Image Gen') ? (
                    <ImageGenInterface />
                ) : tool.id === 'sceneforge-ai' ? (
                    <SceneGenInterface />
                ) : tool.id === 'openusd-nexus' ? (
                    <OpenUSDNexusInterface />
                ) : tool.id === 'replicate-studio' ? (
                    <ReplicateStudio />
                ) : tool.id === 'ad-velocity' ? (
                    <AdVelocity />
                ) : tool.id === 'juneteenth-editor' ? (
                    <JuneteenthEditor />
                ) : tool.id === 'nexus-365' ? (
                    <Nexus365 />
                ) : tool.id === 'agent-playground' ? (
                    <AgentPlayground />
                ) : (
                    <div className="glass-panel placeholder-tool">
                        <h2>{tool.name} Interface</h2>
                        <p>This tool interface is currently being integrated.</p>
                        <div className="placeholder-actions">
                            <button>Launch External</button>
                            <button>View Documentation</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ToolView;
