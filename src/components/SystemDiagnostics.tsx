import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SystemDiagnostics: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const possibleLogs = [
            "SCANNING NETWORK PORTS...",
            "ENCRYPTING DATA STREAM...",
            "OPTIMIZING NEURAL PATHWAYS...",
            "CHECKING INTEGRITY...",
            "SYNCING CLOUD NODES...",
            "ANALYZING USER PATTERNS...",
            "UPDATING SECURITY PROTOCOLS...",
            "BUFFERING VIDEO FEED...",
            "ALLOCATING MEMORY BLOCKS...",
            "PINGING SERVER: 12ms"
        ];

        const interval = setInterval(() => {
            const newLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
            const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            setLogs(prev => [`[${timestamp}] ${newLog}`, ...prev].slice(0, 8));
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute bottom-8 left-32 w-64 pointer-events-none z-10 hidden md:block">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
                className="bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-lg p-3"
            >
                <div className="flex justify-between items-center mb-2 border-b border-cyan-500/20 pb-1">
                    <h4 className="text-cyan-400 text-xs font-mono font-bold tracking-wider">SYSTEM DIAGNOSTICS</h4>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>

                <div className="flex flex-col gap-1 font-mono text-[10px] text-cyan-300/70 h-32 overflow-hidden relative">
                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1 - (i * 0.1), x: 0 }}
                            className="whitespace-nowrap"
                        >
                            {log}
                        </motion.div>
                    ))}
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>

                {/* Memory Usage Graph Simulation */}
                <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>MEMORY</span>
                        <span>4.2GB / 16GB</span>
                    </div>
                    <div className="flex items-end gap-0.5 h-8 border-b border-l border-white/10 p-0.5">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 bg-cyan-500/40"
                                animate={{ height: `${Math.random() * 100}%` }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SystemDiagnostics;
