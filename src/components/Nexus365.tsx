import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    LayoutGrid,
    Mail,
    Calendar,
    FileText,
    Mic,
    Search,
    Bell,
    Settings,
    Cpu,
    Zap,
    MessageSquare,
    CheckCircle,
    Send,
    Sparkles,
    ArrowLeft,
    History,
    Download,
    Volume2,
    VolumeX,
    Users
} from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Command } from 'cmdk';
import HoloGlobe from './HoloGlobe';
import HUDOverlay from './HUDOverlay';
import VoiceVisualizer from './VoiceVisualizer';
import HoloScanner from './HoloScanner';
import { useNexusSound } from '../hooks/useNexusSound';
import { useNexusBrain } from '../hooks/useNexusBrain';
import './Nexus365.css';
import ImageUpload, { type UploadedImage } from './ImageUpload';
import CodeExecutionPanel from './CodeExecutionPanel';
import DemoScenarios from './DemoScenarios';
import GeminiStudio from './GeminiStudio';
import MultiAgentPanel from './MultiAgentPanel';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    images?: UploadedImage[];
    executableCode?: string;
    codeExecutionResult?: any;
    functionCall?: any;
    functionResult?: any;
}

const Nexus365: React.FC = () => {
    const navigate = useNavigate();
    const { playHover, playClick, playType } = useNexusSound();
    const { processQuery, isThinking } = useNexusBrain();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isBooting, setIsBooting] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [performanceMode, setPerformanceMode] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [commandOpen, setCommandOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    // const [apiKey, setApiKey] = useState(localStorage.getItem('GEMINI_API_KEY') || ''); // API Key is now hardcoded
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [showDemos, setShowDemos] = useState(false);
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Boot Sequence
    useEffect(() => {
        const bootTimer = setTimeout(() => setIsBooting(false), 3000);
        return () => clearTimeout(bootTimer);
    }, []);

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
                handleVoiceCommand(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => setIsListening(false);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    // Command Palette Shortcut
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandOpen(open => !open);
            }
            if (e.key === 'h' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setHistoryOpen(open => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const handleVoiceCommand = async (command: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: command,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const response = await processQuery(command);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response || "I'm having trouble connecting to my neural network.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);

            // Speak the response
            if ('speechSynthesis' in window && response && !isMuted) {
                const utterance = new SpeechSynthesisUtterance(response);
                // Try to find a good voice
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v =>
                    v.name.includes('Google US English') ||
                    v.name.includes('Microsoft Zira') ||
                    v.name.includes('Samantha')
                );
                if (preferredVoice) utterance.voice = preferredVoice;
                utterance.rate = 1.0; // Slightly slower for more authority
                utterance.pitch = 1.0;
                window.speechSynthesis.speak(utterance);
            }
        } catch (error) {
            console.error('Voice command error:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Error: Neural link unstable. Please check your connection.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const toggleVoice = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleSendMessage = async (overridePrompt?: string, options: any = {}) => {
        const promptText = overridePrompt || inputValue;
        if (!promptText.trim() && uploadedImages.length === 0) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: promptText,
            timestamp: new Date(),
            images: uploadedImages
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setUploadedImages([]);
        setIsTyping(true);
        setShowDemos(false);

        try {
            // Pass images and options to the brain
            await processQuery(promptText, {
                images: userMessage.images,
                ...options
            });

            // Get the latest state from the brain hook (we need to access the hook's state directly, 
            // but since processQuery is async, we might need to rely on the return value or refetch state.
            // Actually, useNexusBrain updates its state. We should probably return the full result object from processQuery
            // or access the state. For now, let's assume processQuery returns the text and we get other data from the hook state 
            // in the next render cycle? No, that's race-conditiony.
            // Let's modify handleSendMessage to use the data returned by processQuery if we updated it to return full data.
            // Wait, I updated useNexusBrain to return `data.response` (string). 
            // I should have updated it to return the full object. 
            // Let's assume for now I can get the side-effects from the hook state after a small delay or 
            // better yet, let's just use the text response for now and I'll fix the hook return type in a follow-up if needed.
            // Actually, I can access `executableCode` etc from the `useNexusBrain` hook state, but it might not be updated *immediately* 
            // in this closure. 
            // A better approach: The `useNexusBrain` hook exposes `executableCode`, `codeExecutionResult` etc.
            // I should use those values. However, they are state variables.
            // Let's rely on the fact that `processQuery` sets the state, and we can read it.
            // BUT, to save it to the message history, we need the values *right now*.
            // I will modify `useNexusBrain` to return the full object in the next step to be clean.
            // For this step, let's assume `processQuery` returns the text, and we'll grab the extras from the hook state 
            // using a `useEffect` or just by trusting the hook updates.
            // Actually, let's just render the text for now and I'll do a quick fix on `useNexusBrain` to return the full object
            // so I can save it to the message.

            // WAIT: I can't easily change the hook return type in the middle of this multi-replace.
            // I will implement a workaround: I'll read the `useNexusBrain` state in a useEffect to detect when it finishes thinking
            // and then append the message.
            // OR, I can just accept that I need to update `useNexusBrain` first. 
            // I already updated `useNexusBrain` to return `data.response`.
            // Let's stick to the plan: Update UI now, fix data flow if needed.

            // Actually, looking at my previous `useNexusBrain` update:
            // It returns `data.response`.
            // It sets state `executableCode`, `codeExecutionResult`, etc.

            // I will use a `useEffect` to watch `isThinking`. When it goes from true to false, 
            // and there is no error, I'll add the assistant message with all the data.

        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: "I encountered an error processing that request.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Effect to handle AI response completion and add to message history
    // We need to track the previous isThinking state
    const prevIsThinking = useRef(isThinking);
    const { executableCode, codeExecutionResult, functionCall, functionResult, lastResponse, error } = useNexusBrain();

    useEffect(() => {
        if (prevIsThinking.current && !isThinking && !error && lastResponse) {
            // AI just finished thinking
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

            // Speak response
            if ('speechSynthesis' in window && !isMuted) {
                const utterance = new SpeechSynthesisUtterance(lastResponse);
                const voices = window.speechSynthesis.getVoices();
                const preferredVoice = voices.find(v =>
                    v.name.includes('Google US English') ||
                    v.name.includes('Microsoft Zira') ||
                    v.name.includes('Samantha')
                );
                if (preferredVoice) utterance.voice = preferredVoice;
                window.speechSynthesis.speak(utterance);
            }
        }
        prevIsThinking.current = isThinking;
    }, [isThinking, lastResponse, error, executableCode, codeExecutionResult, functionCall, functionResult, isMuted]);

    const executeCommand = (command: string) => {
        setCommandOpen(false);
        switch (command) {
            case 'dashboard':
            case 'email':
            case 'calendar':
            case 'files':
            case 'files':
            case 'studio':
            case 'multi-agent':
            case 'settings':
                setActiveTab(command);
                break;
            case 'voice':
                toggleVoice();
                break;
            case 'history':
                setHistoryOpen(true);
                break;
            case 'export':
                exportConversation();
                break;
            case 'scan':
                setIsScanning(prev => !prev);
                break;
            default:
                handleVoiceCommand(command);
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
        a.download = `nexus-conversation-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearHistory = () => {
        if (confirm('Clear all conversation history?')) {
            setMessages([]);
            setHistoryOpen(false);
        }
    };

    // Simulated "Live" Data
    const emails = [
        { id: 1, from: 'Sarah Connor', subject: 'Project Skynet Timeline', preview: 'We need to discuss the rollout phase...', sentiment: 'neutral', time: '10:42 AM' },
        { id: 2, from: 'Tony Stark', subject: 'Arc Reactor Funding', preview: 'The board is asking for the new specs...', sentiment: 'urgent', time: '10:30 AM' },
        { id: 3, from: 'Bruce Wayne', subject: 'Wayne Ent Merger', preview: 'Attached are the preliminary docs...', sentiment: 'positive', time: '09:15 AM' },
    ];

    const meetings = [
        { id: 1, title: 'Q4 Strategy Sync', time: '11:00 AM - 12:00 PM', attendees: ['Alice', 'Bob', 'Charlie'], status: 'upcoming' },
        { id: 2, title: 'Product Demo: Nexus', time: '02:00 PM - 03:00 PM', attendees: ['Investors'], status: 'pending' },
    ];

    return (
        <div className="nexus-container">
            {/* 3D Holographic Layer */}
            <div className="nexus-3d-layer">
                <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <HoloGlobe speed={performanceMode ? 3 : 1} />
                    <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                </Canvas>
            </div>

            {/* Animated Background Grid */}
            <div className="nexus-grid"></div>

            {/* Jarvis HUD Layer */}
            {!isBooting && (
                <>
                    <HUDOverlay onReactorClick={() => { playClick(); setPerformanceMode(!performanceMode); }} />
                    <VoiceVisualizer isActive={isListening || isTyping || isThinking} />
                    <HoloScanner isActive={isScanning} />
                </>
            )}

            {/* Boot Screen */}
            {isBooting && (
                <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-cyan-400 font-mono text-2xl tracking-[0.5em] mb-4 animate-pulse">INITIALIZING</div>
                        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-cyan-400"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2.5, ease: "easeInOut" }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Back Button */}
            <button
                className="nexus-back-btn"
                onClick={() => { playClick(); navigate('/'); }}
                onMouseEnter={playHover}
                title="Back to Hub"
            >
                <ArrowLeft size={20} />
            </button>

            {/* History Sidebar */}
            <div className={`nexus-history-sidebar ${historyOpen ? 'open' : ''}`}>
                <div className="history-header">
                    <div className="flex items-center gap-2">
                        <History size={20} />
                        <h3>Conversation History</h3>
                    </div>
                    <button onClick={() => setHistoryOpen(false)} className="close-btn">×</button>
                </div>
                <div className="history-content">
                    {messages.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No conversation history yet</p>
                    ) : (
                        <>
                            <div className="history-actions">
                                <button onClick={exportConversation} className="history-action-btn">
                                    <Download size={16} /> Export
                                </button>
                                <button onClick={clearHistory} className="history-action-btn">
                                    Clear All
                                </button>
                            </div>
                            <div className="history-messages">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`history-message ${msg.role}`}>
                                        <div className="history-message-header">
                                            <span className="history-message-role">
                                                {msg.role === 'user' ? 'You' : 'Nexus'}
                                            </span>
                                            <span className="history-message-time">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="history-message-content">{msg.content}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Command Palette */}
            <Command.Dialog open={commandOpen} onOpenChange={setCommandOpen} className="nexus-command-palette">
                <Command.Input placeholder="Type a command or search..." className="nexus-command-input" />
                <Command.List className="nexus-command-list">
                    <Command.Empty>No results found.</Command.Empty>
                    <Command.Group heading="Navigation">
                        <Command.Item onSelect={() => executeCommand('dashboard')}>
                            <LayoutGrid size={16} /> Dashboard
                        </Command.Item>
                        <Command.Item onSelect={() => executeCommand('email')}>
                            <Mail size={16} /> Email
                        </Command.Item>
                        <Command.Item onSelect={() => executeCommand('calendar')}>
                            <Calendar size={16} /> Calendar
                        </Command.Item>
                        <Command.Item onSelect={() => executeCommand('files')}>
                            <FileText size={16} /> Files
                        </Command.Item>
                        <Command.Item onSelect={() => executeCommand('files')}>
                            <FileText size={16} /> Files
                        </Command.Item>
                        <Command.Item onSelect={() => executeCommand('studio')}>
                            <Sparkles size={16} /> Gemini Studio
                        </Command.Item>
                        <Command.Item onSelect={() => executeCommand('multi-agent')}>
                            <Users size={16} /> Multi-Agent System
                        </Command.Item>
                    </Command.Group>
                    <Command.Group heading="Actions">
                        <Command.Item onSelect={() => executeCommand('voice')}>
                            <Mic size={16} /> Start Voice Command
                        </Command.Item>
                        <Command.Item onSelect={() => executeCommand('history')}>
                            <History size={16} /> View History (⌘H)
                        </Command.Item>
                        <Command.Item onSelect={() => executeCommand('export')}>
                            <Download size={16} /> Export Conversation
                        </Command.Item>
                        <Command.Item onSelect={() => executeCommand('What are my priorities today?')}>
                            <Sparkles size={16} /> Get AI Summary
                        </Command.Item>
                    </Command.Group>
                </Command.List>
            </Command.Dialog>

            {/* Sidebar Navigation */}
            <div className="nexus-sidebar">
                <div className="nexus-logo">
                    <Cpu size={32} />
                </div>

                <nav className="nexus-nav">
                    <NavItem
                        icon={<LayoutGrid size={24} />}
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <NavItem
                        icon={<Mail size={24} />}
                        active={activeTab === 'email'}
                        onClick={() => setActiveTab('email')}
                    />
                    <NavItem
                        icon={<Calendar size={24} />}
                        active={activeTab === 'calendar'}
                        onClick={() => setActiveTab('calendar')}
                    />
                    <NavItem
                        icon={<FileText size={24} />}
                        active={activeTab === 'files'}
                        onClick={() => setActiveTab('files')}
                    />
                    <NavItem
                        icon={<Sparkles size={24} />}
                        active={activeTab === 'studio'}
                        onClick={() => setActiveTab('studio')}
                    />
                    <NavItem
                        icon={<Users size={24} />}
                        active={activeTab === 'multi-agent'}
                        onClick={() => setActiveTab('multi-agent')}
                    />
                    <div style={{ marginTop: 'auto' }}>
                        <NavItem
                            icon={<History size={24} />}
                            active={historyOpen}
                            onClick={() => setHistoryOpen(!historyOpen)}
                        />
                        <button
                            onClick={() => {
                                playClick();
                                setSettingsOpen(true);
                            }}
                            onMouseEnter={() => playHover()}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-cyan-400 transition-all group relative"
                        >
                            <Settings className="w-6 h-6" />
                            <span className="absolute left-14 bg-black/80 text-cyan-400 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-cyan-500/30">
                                Settings
                            </span>
                        </button>

                        <button
                            onClick={() => {
                                playClick();
                                setIsMuted(!isMuted);
                            }}
                            onMouseEnter={() => playHover()}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-cyan-400 transition-all group relative"
                        >
                            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                            <span className="absolute left-14 bg-black/80 text-cyan-400 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-cyan-500/30">
                                {isMuted ? 'Unmute' : 'Mute Voice'}
                            </span>
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <main className="nexus-main">
                {/* Header / Command Bar */}
                <header className="nexus-header">
                    <div className="nexus-status">
                        <div className="status-dot"></div>
                        <span className="glitch-text" data-text="NEXUS ONLINE">NEXUS ONLINE</span>
                    </div>

                    <div className="nexus-search" onClick={() => setCommandOpen(true)}>
                        <input type="text" placeholder="Ask Nexus anything... (⌘K)" readOnly />
                        <Search className="search-icon" size={20} />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            className="icon-btn"
                            onClick={() => setHistoryOpen(!historyOpen)}
                            title="History (⌘H)"
                        >
                            <History size={24} />
                        </button>
                        <div className="relative cursor-pointer hover:text-cyan-400 transition-colors">
                            <Bell size={24} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 border-2 border-white/20"></div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="nexus-dashboard">
                    {/* Left Column: Intelligence Feed or Chat */}
                    <div className="flex flex-col gap-6">
                        {activeTab === 'studio' ? (
                            <motion.div
                                className="nexus-panel flex-1 h-full"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <GeminiStudio />
                            </motion.div>
                        ) : activeTab === 'multi-agent' ? (
                            <motion.div
                                className="nexus-panel flex-1 h-full"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <MultiAgentPanel />
                            </motion.div>
                        ) : activeTab === 'dashboard' && messages.length === 0 ? (
                            <>
                                {/* Priority Inbox Panel */}
                                <motion.div
                                    className="nexus-panel flex-1"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="panel-header">
                                        <div className="panel-title">
                                            <Mail size={20} />
                                            <span>Priority Intelligence</span>
                                        </div>
                                        <span className="text-xs text-cyan-400 border border-cyan-400/30 px-2 py-1 rounded">AI TRIAGE ACTIVE</span>
                                    </div>

                                    <div className="flex flex-col gap-2 overflow-y-auto">
                                        {emails.map((email, index) => (
                                            <motion.div
                                                key={email.id}
                                                className="holo-item group"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 + (index * 0.1) }}
                                            >
                                                <div className={`holo-avatar ${email.sentiment === 'urgent' ? 'border-red-500 text-red-500' : ''}`}>
                                                    {email.from.charAt(0)}
                                                </div>
                                                <div className="holo-content">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="holo-title group-hover:text-cyan-400 transition-colors">{email.subject}</h4>
                                                        <span className="holo-meta">{email.time}</span>
                                                    </div>
                                                    <p className="holo-subtitle">{email.preview}</p>
                                                </div>
                                                {email.sentiment === 'urgent' && (
                                                    <Zap size={16} className="text-red-500 ml-2" />
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Active Tasks Panel */}
                                <motion.div
                                    className="nexus-panel h-1/3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="panel-header">
                                        <div className="panel-title">
                                            <CheckCircle size={20} />
                                            <span>Auto-Generated Tasks</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors cursor-pointer">
                                            <div className="w-5 h-5 rounded border border-cyan-400 flex items-center justify-center"></div>
                                            <span className="text-sm">Review 'Project Skynet' proposal</span>
                                            <span className="ml-auto text-xs text-gray-500">From Email</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors cursor-pointer">
                                            <div className="w-5 h-5 rounded border border-purple-500 flex items-center justify-center"></div>
                                            <span className="text-sm">Approve Q4 Budget</span>
                                            <span className="ml-auto text-xs text-gray-500">High Priority</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        ) : (
                            /* AI Chat Panel */
                            <motion.div
                                className="nexus-panel flex-1 flex flex-col"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="panel-header">
                                    <div className="panel-title">
                                        <MessageSquare size={20} />
                                        <span>Nexus AI Assistant</span>
                                    </div>
                                    <button
                                        onClick={() => setShowDemos(!showDemos)}
                                        className={`icon-btn ${showDemos ? 'text-cyan-400 bg-cyan-500/10' : ''}`}
                                        title="Demo Scenarios"
                                    >
                                        <Sparkles size={16} />
                                    </button>
                                    <button onClick={exportConversation} className="icon-btn" title="Export">
                                        <Download size={16} />
                                    </button>
                                </div>

                                {showDemos && (
                                    <div className="mb-4 p-2 bg-black/40 rounded-lg border border-cyan-500/20">
                                        <DemoScenarios onSelectDemo={(prompt, options) => handleSendMessage(prompt, options)} />
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-white/5 border border-white/10'}`}>
                                                {/* Images */}
                                                {msg.images && msg.images.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {msg.images.map(img => (
                                                            <img
                                                                key={img.id}
                                                                src={img.preview}
                                                                alt="Uploaded"
                                                                className="w-24 h-24 object-cover rounded border border-white/20"
                                                            />
                                                        ))}
                                                    </div>
                                                )}

                                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                                                {/* Code Execution Result */}
                                                {msg.executableCode && (
                                                    <CodeExecutionPanel
                                                        code={msg.executableCode}
                                                        result={msg.codeExecutionResult}
                                                    />
                                                )}

                                                {/* Function Call Info */}
                                                {msg.functionCall && (
                                                    <div className="mt-2 text-xs font-mono text-gray-400 bg-black/30 p-2 rounded border border-white/10">
                                                        <div className="flex items-center gap-1 text-cyan-400 mb-1">
                                                            <Zap size={10} />
                                                            <span>Function Called: {msg.functionCall.name}</span>
                                                        </div>
                                                        <div>Args: {JSON.stringify(msg.functionCall.args)}</div>
                                                        {msg.functionResult && (
                                                            <div className="mt-1 text-green-400">
                                                                Result: {JSON.stringify(msg.functionResult)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <span className="text-xs text-gray-500 mt-1 block">
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white/5 border border-white/10 p-3 rounded-lg">
                                                <div className="typing-indicator">
                                                    <span></span><span></span><span></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <ImageUpload onImagesChange={setUploadedImages} maxImages={4} />
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => { playType(); setInputValue(e.target.value); }}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder={uploadedImages.length > 0 ? "Describe these images..." : "Ask Nexus anything..."}
                                            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                                        />
                                        <button
                                            onClick={() => handleSendMessage()}
                                            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-300 transition-all"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Right Column: Schedule & Assistant */}
                    <div className="flex flex-col gap-6">
                        {/* Meeting Briefing */}
                        <motion.div
                            className="nexus-panel"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="panel-header">
                                <div className="panel-title">
                                    <Calendar size={20} />
                                    <span>Next Engagement</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 p-4 rounded-xl border border-white/10 mb-4">
                                <div className="flex justify-between mb-2">
                                    <h3 className="text-lg font-bold text-white">Q4 Strategy Sync</h3>
                                    <span className="text-cyan-400 font-mono">11:00 AM</span>
                                </div>
                                <div className="flex -space-x-2 mb-4">
                                    {['A', 'B', 'C'].map((initial, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-black flex items-center justify-center text-xs">
                                            {initial}
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleVoiceCommand('Generate a briefing for my next meeting')}
                                    className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded text-cyan-300 text-sm transition-all"
                                >
                                    Generate Briefing Doc
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {meetings.slice(1).map(meeting => (
                                    <div key={meeting.id} className="flex items-center justify-between p-3 border border-white/5 rounded bg-black/20">
                                        <div>
                                            <div className="font-medium text-sm">{meeting.title}</div>
                                            <div className="text-xs text-gray-500">{meeting.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Voice Command Panel */}
                        <motion.div
                            className="nexus-panel flex-1 flex items-center justify-center relative overflow-hidden"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent"></div>

                            <div className="text-center z-10">
                                <motion.div
                                    className="w-24 h-24 rounded-full border-2 border-cyan-500/30 flex items-center justify-center mx-auto mb-4 cursor-pointer relative"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={toggleVoice}
                                >
                                    {isListening && (
                                        <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
                                    )}
                                    <Mic size={32} className={isListening ? 'text-cyan-400' : 'text-gray-500'} />
                                </motion.div>
                                <h3 className="text-lg font-light tracking-widest text-gray-400">
                                    {isListening ? 'LISTENING...' : 'VOICE COMMAND'}
                                </h3>
                                <p className="text-xs text-gray-600 mt-2">Click to activate</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Floating Action Button */}
            <motion.button
                className="nexus-fab"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { playClick(); setCommandOpen(true); }}
                onMouseEnter={playHover}
            >
                <MessageSquare size={24} />
            </motion.button>
            {/* Settings Modal */}
            {settingsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 border border-cyan-500/30 rounded-lg p-6 w-full max-w-md shadow-[0_0_30px_rgba(0,240,255,0.2)]"
                    >
                        <h2 className="text-xl font-mono text-cyan-400 mb-4 flex items-center gap-2">
                            <Settings size={20} />
                            SYSTEM CONFIGURATION
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-1">GOOGLE GEMINI API KEY</label>
                                <div className="w-full bg-black/50 border border-green-500/30 rounded px-3 py-2 text-green-400 font-mono flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    SYSTEM CONFIGURED
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Neural link established via secure environment.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => setSettingsOpen(false)}
                                    className="px-4 py-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
                                >
                                    CLOSE
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

const NavItem = ({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) => {
    const { playHover, playClick } = useNexusSound();
    return (
        <div
            className={`nexus-nav-item ${active ? 'active' : ''}`}
            onClick={() => { playClick(); onClick(); }}
            onMouseEnter={playHover}
        >
            {icon}
            {/* Settings Modal */}

        </div>
    );
};

export default Nexus365;
