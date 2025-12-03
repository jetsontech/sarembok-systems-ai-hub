import React, { useState } from 'react';
import {
    Sparkles,
    Youtube,
    Mail,
    Video,
    Image as ImageIcon,
    Type,
    TrendingUp,
    Music,
    Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DemoScenariosProps {
    onSelectDemo: (prompt: string, options: any) => void;
}

const categories = [
    { id: 'strategy', label: 'Strategy & Planning' },
    { id: 'production', label: 'Production' },
    { id: 'post', label: 'Post-Production' }
];

const tools = [
    // Strategy
    {
        id: 'yt-script',
        category: 'strategy',
        icon: Youtube,
        title: 'Viral Scriptwriter',
        description: 'Generate high-retention YouTube scripts',
        prompt: 'Write a viral YouTube video script about [TOPIC]. Include a "Pattern Interrupt" hook, 3 main value points, and a strong Call to Action. Tone: High Energy.',
        color: 'red',
        requiresInput: true,
        inputLabel: 'Video Topic'
    },
    {
        id: 'content-calendar',
        category: 'strategy',
        icon: TrendingUp,
        title: '30-Day Content Plan',
        description: 'Generate a month of content ideas',
        prompt: 'Create a 30-day content calendar for a [NICHE] creator. Include a mix of Shorts, Long-form, and Community posts. Focus on growth and engagement.',
        color: 'blue',
        requiresInput: true,
        inputLabel: 'Niche/Topic'
    },
    {
        id: 'sponsor-pitch',
        category: 'strategy',
        icon: Mail,
        title: 'Sponsor Pitch Generator',
        description: 'Write professional brand pitches',
        prompt: 'Write a persuasive sponsorship pitch email to [BRAND] for my channel about [NICHE]. Highlight my audience engagement and propose 3 creative integration ideas.',
        color: 'green',
        requiresInput: true,
        inputLabel: 'Brand Name'
    },

    // Production
    {
        id: 'thumbnail-gen',
        category: 'production',
        icon: ImageIcon,
        title: 'Thumbnail Artist',
        description: 'Generate click-worthy thumbnails',
        prompt: '[ACTION: GENERATE_IMAGE prompt="YouTube thumbnail for [TOPIC], high contrast, vibrant colors, expressive face, 4k resolution, trending on artstation"]',
        color: 'purple',
        requiresInput: true,
        inputLabel: 'Video Topic'
    },
    {
        id: 'social-repurpose',
        category: 'production',
        icon: Smartphone,
        title: 'Social Repurposer',
        description: 'Turn scripts into social posts',
        prompt: 'Repurpose this text into: 1. A Twitter Thread (5 tweets) 2. An Instagram Caption 3. A LinkedIn Post. Text: [CONTENT]',
        color: 'pink',
        requiresInput: true,
        inputLabel: 'Content/Script'
    },
    {
        id: 'hook-gen',
        category: 'production',
        icon: Sparkles,
        title: 'Hook Generator',
        description: 'Create 10 viral hooks',
        prompt: 'Write 10 viral hooks for a video about [TOPIC]. Use psychological triggers like "Curiosity Gap", "Negativity Bias", and "Specific Numbers".',
        color: 'yellow',
        requiresInput: true,
        inputLabel: 'Video Topic'
    },

    // Post-Production
    {
        id: 'video-enhance',
        category: 'post',
        icon: Video,
        title: 'AI Video Enhancer',
        description: 'Upscale and improve video quality',
        prompt: '[ACTION: PROCESS_VIDEO task="enhance-color"]',
        color: 'cyan',
        requiresInput: false
    },
    {
        id: 'audio-clean',
        category: 'post',
        icon: Music,
        title: 'Audio Denoise',
        description: 'Remove background noise',
        prompt: '[ACTION: PROCESS_AUDIO task="denoise"]',
        color: 'orange',
        requiresInput: false
    },
    {
        id: 'auto-caption',
        category: 'post',
        icon: Type,
        title: 'Auto-Caption Style',
        description: 'Generate caption styles',
        prompt: 'Generate a CSS style for "Hormozi-style" video captions. Yellow text, black outline, bold sans-serif font, pop-in animation.',
        color: 'indigo',
        requiresInput: false
    }
];

const DemoScenarios: React.FC<DemoScenariosProps> = ({ onSelectDemo }) => {
    const [activeCategory, setActiveCategory] = useState('strategy');
    const [selectedTool, setSelectedTool] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');

    const filteredTools = tools.filter(t => t.category === activeCategory);

    const handleToolClick = (tool: any) => {
        if (tool.requiresInput) {
            setSelectedTool(tool.id);
            setInputValue('');
        } else {
            onSelectDemo(tool.prompt, {});
        }
    };

    const handleSubmit = (tool: any) => {
        if (!inputValue.trim()) return;
        const finalPrompt = tool.prompt.replace(/\[.*?\]/g, inputValue);
        onSelectDemo(finalPrompt, {});
        setSelectedTool(null);
    };

    const getColorClasses = (color: string) => {
        const colors: any = {
            red: 'from-red-500/20 to-red-600/20 border-red-500/30 hover:border-red-500/50 text-red-400',
            blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-500/50 text-blue-400',
            green: 'from-green-500/20 to-green-600/20 border-green-500/30 hover:border-green-500/50 text-green-400',
            purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-500/50 text-purple-400',
            pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 hover:border-pink-500/50 text-pink-400',
            yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 hover:border-yellow-500/50 text-yellow-400',
            cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400',
            orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 hover:border-orange-500/50 text-orange-400',
            indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30 hover:border-indigo-500/50 text-indigo-400',
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Category Tabs */}
            <div className="flex p-1 rounded-xl bg-black/20 border border-white/5">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeCategory === cat.id
                                ? 'bg-white/10 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1">
                {filteredTools.map((tool, index) => {
                    const Icon = tool.icon;
                    const isSelected = selectedTool === tool.id;

                    return (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            {isSelected ? (
                                <div className={`p-4 rounded-xl border bg-gradient-to-br ${getColorClasses(tool.color)}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-5 h-5" />
                                            <span className="font-semibold">{tool.title}</span>
                                        </div>
                                        <button
                                            onClick={() => setSelectedTool(null)}
                                            className="text-xs hover:underline opacity-70"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder={tool.inputLabel}
                                            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30"
                                            autoFocus
                                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(tool)}
                                        />
                                        <button
                                            onClick={() => handleSubmit(tool)}
                                            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Go
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleToolClick(tool)}
                                    className={`
                                        w-full p-4 rounded-xl border bg-gradient-to-br
                                        transition-all duration-200 text-left
                                        hover:scale-[1.02] active:scale-[0.98]
                                        ${getColorClasses(tool.color)}
                                    `}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-black/20">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm mb-1">{tool.title}</h4>
                                            <p className="text-xs opacity-70 line-clamp-2">{tool.description}</p>
                                        </div>
                                    </div>
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default DemoScenarios;
