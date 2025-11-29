import React from 'react';
import { motion } from 'framer-motion';

interface VoiceVisualizerProps {
    isActive: boolean;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex items-center gap-1 h-12 z-20">
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1.5 bg-cyan-400 rounded-full"
                    animate={{
                        height: [10, Math.random() * 40 + 10, 10],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: i * 0.05
                    }}
                />
            ))}
        </div>
    );
};

export default VoiceVisualizer;
