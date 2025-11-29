import React from 'react';
import { Code, Play, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface CodeExecutionPanelProps {
    code?: string;
    result?: any;
    language?: string;
}

const CodeExecutionPanel: React.FC<CodeExecutionPanelProps> = ({
    code,
    result,
    language = 'python'
}) => {
    const [copied, setCopied] = useState(false);

    if (!code && !result) return null;

    const handleCopy = () => {
        if (code) {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-3 border border-cyan-500/30 rounded-lg overflow-hidden bg-black/40"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-cyan-500/10 border-b border-cyan-500/30">
                <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono text-cyan-400">
                        {language.toUpperCase()} CODE EXECUTION
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
                    title="Copy code"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                    ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                    )}
                </button>
            </div>

            {/* Code Block */}
            {code && (
                <div className="p-3 bg-gray-900/50">
                    <pre className="text-xs font-mono text-gray-300 overflow-x-auto">
                        <code>{code}</code>
                    </pre>
                </div>
            )}

            {/* Execution Result */}
            {result && (
                <div className="p-3 border-t border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Play className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-mono text-green-400">OUTPUT</span>
                    </div>
                    <pre className="text-xs font-mono text-gray-300 bg-black/30 p-2 rounded overflow-x-auto">
                        {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
                    </pre>
                </div>
            )}
        </motion.div>
    );
};

export default CodeExecutionPanel;
