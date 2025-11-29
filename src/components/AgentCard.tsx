import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain } from 'lucide-react';
import type { Agent } from '../types/Agent';

interface AgentCardProps {
    agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IDLE': return 'text-gray-400 border-gray-700 bg-gray-900/50';
            case 'THINKING': return 'text-purple-400 border-purple-500/50 bg-purple-900/20';
            case 'WORKING': return 'text-cyan-400 border-cyan-500/50 bg-cyan-900/20';
            case 'WAITING': return 'text-yellow-400 border-yellow-500/50 bg-yellow-900/20';
            case 'COMPLETED': return 'text-green-400 border-green-500/50 bg-green-900/20';
            default: return 'text-gray-400 border-gray-700 bg-gray-900/50';
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative p-4 rounded-xl border ${getStatusColor(agent.status)} backdrop-blur-sm transition-colors duration-300`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src={agent.avatar}
                            alt={agent.name}
                            className="w-10 h-10 rounded-full bg-black/50 border border-white/10"
                        />
                        {agent.status === 'THINKING' && (
                            <motion.div
                                className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full"
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                        )}
                        {agent.status === 'WORKING' && (
                            <motion.div
                                className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Activity size={12} className="text-black" />
                            </motion.div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm tracking-wide">{agent.name}</h3>
                        <span className="text-xs opacity-70 font-mono">{agent.role}</span>
                    </div>
                </div>
                <div className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${getStatusColor(agent.status)}`}>
                    {agent.status}
                </div>
            </div>

            <div className="space-y-2">
                {agent.currentTask && (
                    <div className="text-xs bg-black/30 p-2 rounded border border-white/5">
                        <div className="flex items-center gap-1.5 opacity-70 mb-1">
                            <Activity size={10} />
                            <span className="uppercase text-[10px]">Current Task</span>
                        </div>
                        <p className="line-clamp-2">{agent.currentTask}</p>
                    </div>
                )}

                <div className="flex flex-wrap gap-1 mt-2">
                    {agent.capabilities.map((cap, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
                            {cap}
                        </span>
                    ))}
                </div>
            </div>

            {/* Memory Log Preview */}
            {agent.memory.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-[10px] opacity-50 mb-1">
                        <Brain size={10} />
                        <span className="uppercase">Latest Thought</span>
                    </div>
                    <p className="text-[10px] font-mono opacity-60 truncate">
                        {agent.memory[agent.memory.length - 1].split(': ')[1]}
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default AgentCard;
