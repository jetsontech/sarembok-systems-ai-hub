import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Plus, Play, Terminal, Cpu } from 'lucide-react';
import { multiAgentOrchestrator } from '../services/multi-agent-orchestrator';
import type { Agent, AgentMessage, AgentTask } from '../types/Agent';
import AgentCard from './AgentCard';

const MultiAgentPanel: React.FC = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [tasks, setTasks] = useState<AgentTask[]>([]);
    const [newTaskInput, setNewTaskInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initial state
        setAgents([...multiAgentOrchestrator.getAgents()]);
        setMessages([...multiAgentOrchestrator.getMessages()]);
        setTasks([...multiAgentOrchestrator.getTasks()]);

        // Subscribe to updates
        const unsubscribe = multiAgentOrchestrator.subscribe(({ type }) => {
            if (type === 'AGENT_UPDATED') {
                setAgents([...multiAgentOrchestrator.getAgents()]);
            } else if (type === 'MESSAGE_ADDED') {
                setMessages([...multiAgentOrchestrator.getMessages()]);
            } else if (type === 'TASK_ADDED' || type === 'TASK_UPDATED') {
                setTasks([...multiAgentOrchestrator.getTasks()]);
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleAddTask = () => {
        if (!newTaskInput.trim()) return;

        const newTask: AgentTask = {
            id: Math.random().toString(36).substr(2, 9),
            title: newTaskInput,
            description: newTaskInput,
            status: 'PENDING',
            priority: 'MEDIUM'
        };

        multiAgentOrchestrator.assignTask(newTask);
        setNewTaskInput('');
    };

    return (
        <div className="h-full flex flex-col gap-6 p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <Users className="text-cyan-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">Multi-Agent Orchestrator</h2>
                        <p className="text-xs text-gray-400 font-mono">ACTIVE AGENTS: {agents.length} | TASKS: {tasks.length}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-mono transition-colors flex items-center gap-2">
                        <Terminal size={14} />
                        LOGS
                    </button>
                    <button className="px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded text-xs font-mono transition-colors flex items-center gap-2">
                        <Plus size={14} />
                        SPAWN AGENT
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* Left Column: Agents Grid */}
                <div className="col-span-8 flex flex-col gap-4 min-h-0">
                    <div className="flex items-center justify-between text-xs font-mono text-gray-400 uppercase tracking-wider">
                        <span>Active Neural Nodes</span>
                        <Cpu size={14} />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-2">
                        <AnimatePresence>
                            {agents.map(agent => (
                                <AgentCard key={agent.id} agent={agent} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Column: Communication & Tasks */}
                <div className="col-span-4 flex flex-col gap-4 min-h-0">
                    {/* Task Input */}
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Plus size={14} />
                            Assign New Task
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTaskInput}
                                onChange={(e) => setNewTaskInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                placeholder="Describe task for agents..."
                                className="flex-1 bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-cyan-500/50 focus:outline-none font-mono"
                            />
                            <button
                                onClick={handleAddTask}
                                aria-label="Add Task"
                                className="p-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 rounded transition-colors"
                            >
                                <Play size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Live Feed */}
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-xl flex flex-col min-h-0 backdrop-blur-sm">
                        <div className="p-3 border-b border-white/5 flex items-center justify-between">
                            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <MessageSquare size={14} />
                                Neural Link Feed
                            </span>
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-600 italic py-10">
                                    System initialized. Waiting for agent activity...
                                </div>
                            )}
                            {messages.map((msg) => {
                                const agent = agents.find(a => a.id === msg.fromAgentId);
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex flex-col gap-1"
                                    >
                                        <div className="flex items-center justify-between opacity-50">
                                            <span className="text-cyan-400">{agent?.name || 'Unknown'}</span>
                                            <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div className={`p-3 rounded border ${msg.type === 'TASK_ASSIGNMENT' ? 'bg-purple-900/20 border-purple-500/30 text-purple-200' :
                                            msg.type === 'TASK_UPDATE' ? 'bg-green-900/20 border-green-500/30 text-green-200' :
                                                'bg-white/5 border-white/10 text-gray-300'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiAgentPanel;
