import React from 'react';
import { motion } from 'framer-motion';

interface HoloScannerProps {
    isActive: boolean;
}

const HoloScanner: React.FC<HoloScannerProps> = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            {/* Scanning Line */}
            <motion.div
                initial={{ top: "-10%" }}
                animate={{ top: "110%" }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute left-0 right-0 h-1 bg-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.8)]"
            />

            {/* Grid Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.2, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"
            />

            {/* Target Reticle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-64 h-64 border border-cyan-500/30 rounded-full flex items-center justify-center relative"
                >
                    <div className="absolute inset-0 border-t-2 border-b-2 border-cyan-400/80 rounded-full"></div>
                    <div className="w-56 h-56 border border-dashed border-cyan-500/30 rounded-full"></div>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 text-cyan-400 text-xs font-mono tracking-widest">ANALYZING TARGET</div>
                </motion.div>
            </div>

            {/* Data Readouts */}
            <div className="absolute top-1/3 left-1/4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.2 }}
                    className="text-cyan-400 text-xs font-mono"
                >
                    MATCH FOUND: 98.4%
                </motion.div>
            </div>
            <div className="absolute bottom-1/3 right-1/4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3 }}
                    className="text-cyan-400 text-xs font-mono"
                >
                    THREAT LEVEL: 0
                </motion.div>
            </div>
        </div>
    );
};

export default HoloScanner;
