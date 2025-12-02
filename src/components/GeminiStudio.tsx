import React, { useState } from 'react';
import { Sparkles, Sliders, Save, Play, Code, Zap } from 'lucide-react';
import { aiOrchestrator } from '../services/ai-orchestrator';

const GeminiStudio: React.FC = () => {
    const [activeMode, setActiveMode] = useState<'chat' | 'structured' | 'tuning'>('structured');
    const [prompt, setPrompt] = useState('');
    const [output, setOutput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [temperature, setTemperature] = useState(0.9);
    const [topK, setTopK] = useState(40);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        try {
            const result = await aiOrchestrator.chat(prompt, activeMode === 'structured' ? 'You are a structured data generator. Output JSON only.' : undefined);
            if (result.success) {
                setOutput(result.data);
            } else {
                setOutput(`Error: ${result.error}`);
            }
        } catch (e) {
            setOutput('An unexpected error occurred.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-cyan-400" size={24} />
                    <h2 className="text-xl font-bold text-white">Gemini AI Studio</h2>
                </div>
                <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setActiveMode('structured')}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${activeMode === 'structured' ? 'bg-cyan-500/20 text-cyan-300' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Code size={16} className="inline mr-2" />
                        Structured
                    </button>
                    <button
                        onClick={() => setActiveMode('tuning')}
                        className={`px-3 py-1.5 rounded-md text-sm transition-all ${activeMode === 'tuning' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Sliders size={16} className="inline mr-2" />
                        Tuning
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6">
                {/* Left Panel: Configuration */}
                <div className="col-span-4 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col gap-6">
                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-2">MODEL</label>
                        <div className="p-3 bg-black/40 rounded border border-white/10 flex items-center justify-between">
                            <span className="text-sm text-white">Gemini 2.0 Flash</span>
                            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">Active</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-2">TEMPERATURE: {temperature}</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400"
                            aria-label="Temperature"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Precise</span>
                            <span>Creative</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-2">TOP K: {topK}</label>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value={topK}
                            onChange={(e) => setTopK(parseInt(e.target.value))}
                            className="w-full accent-purple-400"
                            aria-label="Top K"
                        />
                    </div>

                    <div className="mt-auto">
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-cyan-400 mb-2">
                                <Zap size={16} />
                                <span className="text-sm font-bold">Pro Tip</span>
                            </div>
                            <p className="text-xs text-cyan-300/80">
                                Use structured prompts to generate JSON for data integration.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Input/Output */}
                <div className="col-span-8 flex flex-col gap-4">
                    <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col">
                        <label className="block text-xs font-mono text-gray-400 mb-2">INPUT PROMPT</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={activeMode === 'structured' ? "Describe the data structure you need..." : "Enter your prompt..."}
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none font-mono"
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating}
                                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} fill="currentColor" />
                                        Run
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="h-1/2 bg-black/60 rounded-xl border border-white/10 p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-xs font-mono text-gray-400">OUTPUT</label>
                            <button className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                                <Save size={12} /> Save
                            </button>
                        </div>
                        <pre className="flex-1 overflow-auto text-xs font-mono text-green-400 p-2">
                            {output || '// Output will appear here...'}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeminiStudio;
