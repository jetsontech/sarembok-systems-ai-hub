import React, { useState, useRef } from 'react';
import './AgentPlayground.css';

interface Node {
    id: string;
    type: 'agent' | 'trigger' | 'action';
    label: string;
    x: number;
    y: number;
}

interface Connection {
    id: string;
    from: string;
    to: string;
}

const AgentPlayground: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>([
        { id: '1', type: 'trigger', label: 'Start Trigger', x: 100, y: 100 },
        { id: '2', type: 'agent', label: 'Gemini Agent', x: 400, y: 100 },
        { id: '3', type: 'action', label: 'Save to DB', x: 700, y: 100 },
    ]);

    // Connections state is kept for rendering lines
    const [connections] = useState<Connection[]>([
        { id: 'c1', from: '1', to: '2' },
        { id: 'c2', from: '2', to: '3' }
    ]);

    const [draggingId, setDraggingId] = useState<string | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const handleMouseDown = (id: string) => {
        setDraggingId(id);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (draggingId) {
            setNodes(prev => prev.map(node => {
                if (node.id === draggingId) {
                    return {
                        ...node,
                        x: node.x + e.movementX,
                        y: node.y + e.movementY
                    };
                }
                return node;
            }));
        }
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    const getNodeCenter = (id: string) => {
        const node = nodes.find(n => n.id === id);
        if (!node) return { x: 0, y: 0 };
        return { x: node.x + 75, y: node.y + 40 }; // Assuming node width 150, height 80
    };

    const [isRunning, setIsRunning] = useState(false);
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

    const handleRun = () => {
        setIsRunning(true);
        setActiveNodeId('1'); // Start at trigger

        // Simulate flow
        setTimeout(() => setActiveNodeId('2'), 1000);
        setTimeout(() => setActiveNodeId('3'), 2500);
        setTimeout(() => {
            setActiveNodeId(null);
            setIsRunning(false);
            alert('Workflow completed successfully!');
        }, 4000);
    };

    return (
        <div className="playground-container">
            <div className="playground-toolbar glass-panel">
                <div className="toolbar-group">
                    <button className="tool-btn" onClick={() => setNodes(prev => [...prev, { id: Date.now().toString(), type: 'agent', label: 'New Agent', x: 100, y: 100 }])}>+ Agent</button>
                    <button className="tool-btn" onClick={() => setNodes(prev => [...prev, { id: Date.now().toString(), type: 'trigger', label: 'Trigger', x: 100, y: 100 }])}>+ Trigger</button>
                    <button className="tool-btn" onClick={() => setNodes(prev => [...prev, { id: Date.now().toString(), type: 'action', label: 'Action', x: 100, y: 100 }])}>+ Action</button>
                </div>
                <button
                    className={`run-btn ${isRunning ? 'running' : ''}`}
                    onClick={handleRun}
                    disabled={isRunning}
                >
                    {isRunning ? 'Running...' : '▶ Run Workflow'}
                </button>
            </div>

            <div
                className="canvas"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <svg className="connections-layer" ref={svgRef}>
                    {connections.map(conn => {
                        const start = getNodeCenter(conn.from);
                        const end = getNodeCenter(conn.to);
                        return (
                            <path
                                key={conn.id}
                                d={`M ${start.x} ${start.y} C ${start.x + 50} ${start.y}, ${end.x - 50} ${end.y}, ${end.x} ${end.y}`}
                                stroke="var(--color-primary)"
                                strokeWidth="2"
                                fill="none"
                                className="connection-line"
                            />
                        );
                    })}
                </svg>

                {nodes.map(node => (
                    <div
                        key={node.id}
                        className={`node ${node.type} glass-panel ${activeNodeId === node.id ? 'active-execution' : ''}`}
                        style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                        onMouseDown={() => handleMouseDown(node.id)}
                    >
                        <div className="node-header">{node.type}</div>
                        <div className="node-content">{node.label}</div>
                        <div className="node-handle input"></div>
                        <div className="node-handle output"></div>
                        {activeNodeId === node.id && <div className="execution-spinner"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AgentPlayground;
