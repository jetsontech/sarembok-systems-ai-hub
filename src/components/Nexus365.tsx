import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutGrid,
    Mic,
    MicOff,
    Settings,
    MessageSquare,
    Send,
    Palette,
    History,
    Download,
    Users,
    Activity,
    X,
    Home
} from 'lucide-react';
import { useNexusSound } from '../hooks/useNexusSound';
import { useNexusBrain } from '../hooks/useNexusBrain';
import './Nexus365.css';
import './Nexus365-responsive.css';
import DemoScenarios from './DemoScenarios';
import MultiAgentPanel from './MultiAgentPanel';
import MediaPanel, { type MediaItem } from './MediaPanel';
import ApiSettings from './ApiSettings';
import { BackendService } from '../services/BackendService';
import { aiOrchestrator } from '../services/ai-orchestrator';
import ReactMarkdown from 'react-markdown';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    executableCode?: string;
    codeExecutionResult?: any;
    functionCall?: any;
    functionResult?: any;
}

const Nexus365: React.FC = () => {
    const { playClick, playType } = useNexusSound();
    const { processQuery, isThinking, lastResponse, error, executableCode, codeExecutionResult, functionCall, functionResult } = useNexusBrain();

    // State
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isListening, setIsListening] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevIsThinking = useRef(isThinking);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                handleSendMessage(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isThinking]);

    // Handle AI Response
    useEffect(() => {
        if (prevIsThinking.current && !isThinking && !error && lastResponse) {
            const aiMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: lastResponse,
                timestamp: new Date(),
                executableCode,
                codeExecutionResult,
                functionCall,
                functionResult
            };
            setMessages(prev => [...prev, aiMessage]);

            // Check for processing actions
            const audioMatch = lastResponse.match(/\[ACTION: PROCESS_AUDIO task="([^"]+)"\]/);
            const imageMatch = lastResponse.match(/\[ACTION: PROCESS_IMAGE task="([^"]+)"(?:\s+param="([^"]+)")?\]/);
            const videoMatch = lastResponse.match(/\[ACTION: PROCESS_VIDEO task="([^"]+)"(?:\s+param="([^"]+)")?\]/);
            const genImageMatch = lastResponse.match(/\[ACTION: GENERATE_IMAGE prompt="([^"]+)"\]/);

            if (audioMatch) {
                handleAudioProcessing(audioMatch[1]);
            } else if (imageMatch) {
                handleImageProcessing(imageMatch[1], imageMatch[2]);
            } else if (videoMatch) {
                handleVideoProcessing(videoMatch[1], videoMatch[2]);
            } else if (genImageMatch) {
                handleImageGeneration(genImageMatch[1]);
            }

            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(lastResponse.replace(/\[ACTION:.*?\]/g, ''));
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v =>
                    v.name.includes('Google US English') ||
                    v.name.includes('Microsoft Zira')
                );
                if (preferredVoice) utterance.voice = preferredVoice;
                window.speechSynthesis.speak(utterance);
            }
        }
        prevIsThinking.current = isThinking;
    }, [isThinking, lastResponse, error, executableCode, codeExecutionResult, functionCall, functionResult]);

    const handleAudioProcessing = async (task: string) => {
        const audioItem = mediaItems.find(item => item.type === 'audio' || item.type === 'video');
        if (!audioItem || !(audioItem.content instanceof File)) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Error: No audio file found to process. Please upload a file first.",
                timestamp: new Date()
            }]);
            return;
        }

        try {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `⚡ Sending ${audioItem.name} to Nexus Audio Engine for ${task}...`,
                timestamp: new Date()
            }]);

            const processedBlob = await BackendService.processAudio(audioItem.content, task);

            // Create new media item for the result
            const newFile = new File([processedBlob], `processed_${audioItem.name}`, { type: 'audio/wav' });
            const newItem: MediaItem = {
                id: Date.now().toString(),
                type: 'audio',
                name: `processed_${audioItem.name}`,
                content: newFile,
                timestamp: new Date()
            };

            setMediaItems(prev => [newItem, ...prev]);

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `✅ Processing complete! New file: processed_${audioItem.name}`,
                timestamp: new Date()
            }]);

        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `❌ Processing failed: ${error}`,
                timestamp: new Date()
            }]);
        }
    };

    const handleImageProcessing = async (task: string, param?: string) => {
        const imageItem = mediaItems.find(item => item.name.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i));
        if (!imageItem || !(imageItem.content instanceof File)) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Error: No image file found to process. Please upload an image first.",
                timestamp: new Date()
            }]);
            return;
        }

        try {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `🎨 Processing ${imageItem.name} with ${task}...`,
                timestamp: new Date()
            }]);

            const processedBlob = await BackendService.processImage(imageItem.content, task, param);

            const newFile = new File([processedBlob], `processed_${imageItem.name}`, { type: 'image/png' });
            const newItem: MediaItem = {
                id: Date.now().toString(),
                type: 'code', // Using 'code' as generic file type
                name: `processed_${imageItem.name}`,
                content: newFile,
                timestamp: new Date()
            };

            setMediaItems(prev => [newItem, ...prev]);

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `✅ Image processing complete! New file: processed_${imageItem.name}`,
                timestamp: new Date()
            }]);

        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `❌ Processing failed: ${error}`,
                timestamp: new Date()
            }]);
        }
    };

    const handleVideoProcessing = async (task: string, param?: string) => {
        const videoItem = mediaItems.find(item => item.type === 'video');
        if (!videoItem || !(videoItem.content instanceof File)) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Error: No video file found to process. Please upload a video first.",
                timestamp: new Date()
            }]);
            return;
        }

        try {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `🎬 Processing ${videoItem.name} with ${task}...`,
                timestamp: new Date()
            }]);

            const processedBlob = await BackendService.processVideo(videoItem.content, task, param);

            const newFile = new File([processedBlob], `processed_${videoItem.name}`, { type: 'video/mp4' });
            const newItem: MediaItem = {
                id: Date.now().toString(),
                type: 'video',
                name: `processed_${videoItem.name}`,
                content: newFile,
                timestamp: new Date()
            };

            setMediaItems(prev => [newItem, ...prev]);

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `✅ Video processing complete! New file: processed_${videoItem.name}`,
                timestamp: new Date()
            }]);

        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `❌ Processing failed: ${error}`,
                timestamp: new Date()
            }]);
        }
    };

    const handleImageGeneration = async (prompt: string) => {
        try {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `🎨 Generating image: "${prompt}"...`,
                timestamp: new Date()
            }]);

            const result = await aiOrchestrator.generateImage(prompt);

            if (result.success && result.data) {
                // Pollinations returns a URL
                const imageUrl = result.data;

                // Fetch the image to create a File object (so it appears in Media Panel)
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const file = new File([blob], `generated_${Date.now()}.jpg`, { type: 'image/jpeg' });

                const newItem: MediaItem = {
                    id: Date.now().toString(),
                    type: 'image',
                    name: `generated_${Date.now()}.jpg`,
                    content: file,
                    timestamp: new Date()
                };

                setMediaItems(prev => [newItem, ...prev]);

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `✅ Image generated successfully!\n\n![Generated Image](${imageUrl})`,
                    timestamp: new Date()
                }]);
            } else {
                throw new Error(result.error || 'Generation failed');
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: `❌ Image generation failed: ${error}`,
                timestamp: new Date()
            }]);
        }
    };

    const handleSendMessage = async (overridePrompt?: string) => {
        const promptText = overridePrompt || inputValue;
        if (!promptText.trim()) return;

        playClick();

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: promptText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // If we're not on the chat tab, switch to it so the user sees the interaction
        if (activeTab !== 'chat') setActiveTab('chat');

        try {
            // Check for uploaded media to include in context
            let finalPrompt = promptText;
            if (mediaItems.length > 0) {
                const mediaContext = mediaItems.map(item =>
                    `[File: ${item.name} (${item.type})]`
                ).join('\n');

                finalPrompt = `${promptText}\n\nContext - Uploaded Files:\n${mediaContext}\n\nSYSTEM INSTRUCTION: You are Nexus, a powerful AI with multimedia processing capabilities. When users request media processing, output command tags:

AUDIO: [ACTION: PROCESS_AUDIO task="restructure-hiphop"] or task="denoise", "speed-up", "slow-down"
IMAGE: [ACTION: PROCESS_IMAGE task="enhance-brightness"] or task="resize", "sharpen", "blur", "grayscale", "edge-detect", "emboss", "enhance-contrast", "enhance-color"
VIDEO: [ACTION: PROCESS_VIDEO task="trim" param="0-10"] or task="speed-up", "slow-down"

Acknowledge the request briefly, then output the appropriate tag. Do NOT provide scripts.`;
            }

            await processQuery(finalPrompt);
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    const toggleVoice = () => {
        playClick();
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const exportConversation = () => {
        const conversation = messages.map(m =>
            `[${m.timestamp.toLocaleTimeString()}] ${m.role === 'user' ? 'You' : 'Nexus'}: ${m.content}`
        ).join('\n\n');

        const blob = new Blob([conversation], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nexus-chat-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="nexus-container">
            {/* Sidebar Dock */}
            <div className="nexus-sidebar">
                <div className="p-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                        N
                    </div>
                </div>

                <nav className="nexus-nav">
                    <div
                        className={`nexus-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { playClick(); setActiveTab('dashboard'); }}
                        title="Dashboard"
                    >
                        <LayoutGrid size={24} />
                    </div>
                    <div
                        className={`nexus-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                        onClick={() => { playClick(); setActiveTab('chat'); }}
                        title="Nexus AI Chat"
                    >
                        <MessageSquare size={24} />
                    </div>
                    <div
                        className={`nexus-nav-item ${activeTab === 'studio' ? 'active' : ''}`}
                        onClick={() => { playClick(); setActiveTab('studio'); }}
                        title="Creative Studio"
                    >
                        <Palette size={24} />
                    </div>
                    <div
                        className={`nexus-nav-item ${activeTab === 'agents' ? 'active' : ''}`}
                        onClick={() => { playClick(); setActiveTab('agents'); }}
                        title="Agent Swarm"
                    >
                        <Users size={24} />
                    </div>
                </nav>

                <div className="mt-auto mb-6 flex flex-col gap-4">
                    <div
                        className="nexus-nav-item"
                        onClick={() => { playClick(); setIsSettingsOpen(true); }}
                        title="Settings"
                    >
                        <Settings size={24} />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="nexus-main">
                {/* Header */}
                <header className="nexus-header">
                    <div className="nexus-brand">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all mr-4"
                            title="Back to Hub"
                        >
                            <Home size={16} />
                            <span className="hidden sm:inline text-sm">Hub</span>
                        </button>
                        <span>Nexus 365</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">PRO</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="nexus-status">
                            <div className="status-dot" />
                            <span>Pollinations AI Active</span>
                        </div>

                        <button
                            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${isHistoryOpen ? 'bg-white/10 border-white/20 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                            onClick={() => { playClick(); setIsHistoryOpen(!isHistoryOpen); }}
                            title="History"
                        >
                            <History size={20} />
                        </button>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="nexus-dashboard">
                    {/* Primary Panel (Dynamic Content) */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'dashboard' ? (
                            <motion.div
                                key="dashboard"
                                className="nexus-panel"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="panel-header">
                                    <div className="panel-title">
                                        <Activity size={16} />
                                        <span>System Overview</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-6">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-medium text-white mb-2">Welcome to Nexus 365</h3>
                                        <p className="text-gray-400">Select a module to begin your workflow.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                                        <button
                                            onClick={() => setActiveTab('chat')}
                                            className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all group text-left"
                                        >
                                            <MessageSquare className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                                            <div className="text-white font-medium">New Chat</div>
                                            <div className="text-sm text-gray-500">Start a conversation with Pollinations AI</div>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('agents')}
                                            className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all group text-left"
                                        >
                                            <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                                            <div className="text-white font-medium">Agent Swarm</div>
                                            <div className="text-sm text-gray-500">Deploy autonomous AI agents</div>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : activeTab === 'chat' ? (
                            <motion.div
                                key="chat"
                                className="nexus-panel"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="panel-header">
                                    <div className="panel-title">
                                        <MessageSquare size={16} />
                                        <span>Nexus AI</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={exportConversation}
                                            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                            title="Export Chat"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="chat-container">
                                    {messages.length === 0 && (
                                        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                                            Start a conversation...
                                        </div>
                                    )}
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`chat-message ${msg.role}`}>
                                            <div className="markdown-content">
                                                <ReactMarkdown
                                                    components={{
                                                        img: ({ node, ...props }) => <img {...props} className="rounded-lg max-w-full h-auto my-2 border border-white/10 shadow-lg" />,
                                                        a: ({ node, ...props }) => <a {...props} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" />,
                                                        code: ({ node, ...props }) => <code {...props} className="bg-black/30 rounded px-1 py-0.5 text-sm font-mono text-blue-300" />
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                    {isThinking && (
                                        <div className="chat-message ai flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75" />
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" />
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="chat-input-wrapper">
                                    <input
                                        type="text"
                                        className="chat-input"
                                        placeholder="Ask Nexus anything..."
                                        value={inputValue}
                                        onChange={(e) => { playType(); setInputValue(e.target.value); }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        autoFocus
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <button
                                            className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/5 text-gray-400'}`}
                                            onClick={toggleVoice}
                                            title={isListening ? "Stop Voice" : "Start Voice"}
                                        >
                                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                        </button>
                                        <button
                                            className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                                            onClick={() => handleSendMessage()}
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : activeTab === 'agents' ? (
                            <motion.div
                                key="agents"
                                className="nexus-panel"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <MultiAgentPanel />
                            </motion.div>
                        ) : activeTab === 'studio' ? (
                            <motion.div
                                key="studio"
                                className="nexus-panel"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="panel-header">
                                    <div className="panel-title">
                                        <Palette size={16} />
                                        <span>Creative Studio</span>
                                    </div>
                                </div>
                                <DemoScenarios onSelectDemo={(prompt) => handleSendMessage(prompt)} />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {/* Secondary Panel (Media Hub) */}
                    <div className="nexus-panel">
                        <MediaPanel mediaItems={mediaItems} setMediaItems={setMediaItems} />
                    </div>
                </div>
            </div>

            {/* History Sidebar Overlay */}
            <div className={`nexus-history-sidebar ${isHistoryOpen ? 'open' : ''}`}>
                <div className="history-header">
                    <h3 className="text-lg font-semibold text-white">History</h3>
                    <button
                        className="text-gray-400 hover:text-white"
                        onClick={() => setIsHistoryOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="history-content">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                            No recent history
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.filter(m => m.role === 'user').map((msg, i) => (
                                <div key={i} className="p-3 rounded bg-white/5 border border-white/10 text-sm text-gray-300 cursor-pointer hover:bg-white/10 transition-colors">
                                    <div className="line-clamp-2">{msg.content}</div>
                                    <div className="text-xs text-gray-500 mt-1">{msg.timestamp.toLocaleTimeString()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Settings Modal */}
            <ApiSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

export default Nexus365;
