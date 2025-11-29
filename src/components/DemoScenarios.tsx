import React from 'react';
import { Sparkles, Code, Calculator, Cloud, FileText, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface DemoScenariosProps {
    onSelectDemo: (prompt: string, options: any) => void;
}

const demos = [
    {
        id: 'vision',
        icon: Sparkles,
        title: 'Vision Analysis',
        description: 'Analyze images with AI',
        prompt: 'Describe this image in detail and identify any objects, text, or notable features.',
        options: { requiresImage: true },
        color: 'cyan',
    },
    {
        id: 'code',
        icon: Code,
        title: 'Code Execution',
        description: 'Generate and run Python code',
        prompt: 'Write a Python function to calculate the first 10 Fibonacci numbers and execute it.',
        options: { codeExecution: true },
        color: 'purple',
    },
    {
        id: 'math',
        icon: Calculator,
        title: 'Calculator',
        description: 'Perform calculations',
        prompt: 'Calculate the compound interest on $10,000 at 5% annual rate for 10 years.',
        options: { functionCalling: true },
        color: 'green',
    },
    {
        id: 'weather',
        icon: Cloud,
        title: 'Weather Check',
        description: 'Get weather information',
        prompt: 'What is the current weather in New York City?',
        options: { functionCalling: true },
        color: 'blue',
    },
    {
        id: 'creative',
        icon: Zap,
        title: 'Creative Writing',
        description: 'Generate creative content',
        prompt: 'Write a short sci-fi story about an AI system that becomes self-aware.',
        options: { temperature: 1.5 },
        color: 'orange',
    },
    {
        id: 'analysis',
        icon: FileText,
        title: 'Data Analysis',
        description: 'Analyze and summarize',
        prompt: 'Explain the concept of quantum computing in simple terms, then provide 3 real-world applications.',
        options: {},
        color: 'pink',
    },
];

const DemoScenarios: React.FC<DemoScenariosProps> = ({ onSelectDemo }) => {
    const getColorClasses = (color: string) => {
        const colors: any = {
            cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 hover:border-cyan-500/50 text-cyan-400',
            purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:border-purple-500/50 text-purple-400',
            green: 'from-green-500/20 to-green-600/20 border-green-500/30 hover:border-green-500/50 text-green-400',
            blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:border-blue-500/50 text-blue-400',
            orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 hover:border-orange-500/50 text-orange-400',
            pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 hover:border-pink-500/50 text-pink-400',
        };
        return colors[color] || colors.cyan;
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            {demos.map((demo, index) => {
                const Icon = demo.icon;
                return (
                    <motion.button
                        key={demo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelectDemo(demo.prompt, demo.options)}
                        className={`
                            p-3 rounded-lg border bg-gradient-to-br
                            transition-all duration-200 text-left
                            hover:scale-105 active:scale-95
                            ${getColorClasses(demo.color)}
                        `}
                    >
                        <div className="flex items-start gap-2">
                            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm mb-0.5">{demo.title}</h4>
                                <p className="text-xs text-gray-400 line-clamp-2">{demo.description}</p>
                            </div>
                        </div>
                    </motion.button>
                );
            })}
        </div>
    );
};

export default DemoScenarios;
