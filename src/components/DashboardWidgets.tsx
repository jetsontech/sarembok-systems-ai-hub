import React, { useEffect, useState } from 'react';
import { Users, Sparkles, Activity, Zap } from 'lucide-react';
import { multiAgentOrchestrator } from '../services/multi-agent-orchestrator';
import type { Agent, AgentTask } from '../types/Agent';

export const AgentStatusWidget: React.FC = () => {
    const [agents, setAgents] = useState<Agent[]>([]);

    useEffect(() => {
        setAgents(multiAgentOrchestrator.getAgents());
        return multiAgentOrchestrator.subscribe(({ type }) => {
            if (type === 'AGENT_UPDATED') {
                setAgents([...multiAgentOrchestrator.getAgents()]);
            }
        });
    }, []);

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-cyan-400">
                    <Users size={18} />
                    <h3 className="font-semibold">Neural Grid Status</h3>
                </div>
                <span className="text-xs text-cyan-400/60 bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-500/20">
                    {agents.filter(a => a.status !== 'IDLE').length} Active
                </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
                {agents.map(agent => (
                    <div key={agent.id} className="flex flex-col items-center gap-1 group relative">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${agent.status === 'WORKING' ? 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' :
                            agent.status === 'THINKING' ? 'border-purple-400 animate-pulse' :
                                'border-white/10 grayscale opacity-50'
                            }`}>
                            <img src={agent.avatar} alt={agent.name} className="w-8 h-8" />
                        </div>
                        <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-xs px-2 py-1 rounded border border-white/10 whitespace-nowrap z-10 pointer-events-none">
                            {agent.name} ({agent.status})
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ActiveTasksWidget: React.FC = () => {
    const [tasks, setTasks] = useState<AgentTask[]>([]);

    useEffect(() => {
        setTasks(multiAgentOrchestrator.getTasks());
        return multiAgentOrchestrator.subscribe(({ type }) => {
            if (type === 'TASK_ADDED' || type === 'TASK_UPDATED') {
                setTasks([...multiAgentOrchestrator.getTasks()]);
            }
        });
    }, []);

    const activeTasks = tasks.filter(t => t.status !== 'COMPLETED').slice(0, 3);

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex-1">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-purple-400">
                    <Activity size={18} />
                    <h3 className="font-semibold">Active Processes</h3>
                </div>
                <span className="text-xs text-white/40">{activeTasks.length} Running</span>
            </div>
            <div className="flex flex-col gap-2">
                {activeTasks.length === 0 ? (
                    <div className="text-center py-4 text-white/30 text-sm">
                        System Idle. No active processes.
                    </div>
                ) : (
                    activeTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 p-2 bg-black/20 rounded border border-white/5">
                            <div className={`w-2 h-2 rounded-full ${task.status === 'IN_PROGRESS' ? 'bg-cyan-400 animate-pulse' : 'bg-yellow-400'
                                }`} />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm truncate text-white/80">{task.title}</div>
                                <div className="text-xs text-white/40 truncate">{task.description}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export const QuickActionsWidget: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-4">
                <Zap size={18} />
                <h3 className="font-semibold">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => onNavigate('studio')}
                    className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-white/10 rounded-lg flex flex-col items-center gap-2 transition-all group"
                >
                    <Sparkles size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-white/70">Gemini Studio</span>
                </button>
                <button
                    onClick={() => onNavigate('multi-agent')}
                    className="p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 hover:from-cyan-500/30 hover:to-teal-500/30 border border-white/10 rounded-lg flex flex-col items-center gap-2 transition-all group"
                >
                    <Users size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-white/70">Manage Agents</span>
                </button>
            </div>
        </div>
    );
};
