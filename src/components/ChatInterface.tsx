import React, { useState, useRef, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useHistory } from '../context/HistoryContext';
import { aiOrchestrator } from '../services/ai-orchestrator';
import PromptGenerator from './PromptGenerator';
import './ChatInterface.css';

// Add types for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const ChatInterface: React.FC = () => {
    const { contextDescription, tone } = useProject();
    const { addToHistory } = useHistory();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `Hello! I'm ready to help. ${contextDescription ? `I see we're working on: "${contextDescription}".` : ''} How can I assist you today?`,
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showPromptGen, setShowPromptGen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

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
                setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any current speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            // Try to select a decent voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        addToHistory({
            type: 'chat',
            content: inputValue,
            metadata: { role: 'user' }
        });

        setInputValue('');
        setIsTyping(true);

        try {
            // Construct the prompt with context and tone
            const systemContext = contextDescription ? `Context: ${contextDescription}. ` : '';
            const toneInstruction = `Respond in a ${tone} tone.`;
            const fullPrompt = `${systemContext}${toneInstruction} User: ${newMessage.content}`;

            const response = await aiOrchestrator.chat(fullPrompt);

            if (!response.success) {
                throw new Error(response.error || 'API Error');
            }

            const text = response.data;

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: text,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);

            // Auto-speak the response if it was a voice interaction (optional, but nice)
            // For now, we'll just let the user click to speak to avoid annoyance
        } catch (error: any) {
            console.error('Chat Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: error.message === 'Content filtered'
                    ? "⚠️ I cannot fulfill this request due to safety guidelines. Please try a different prompt."
                    : "I'm having trouble connecting to the neural network right now. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="chat-interface glass-panel">
            <div className="chat-header-controls">
                {isSpeaking && (
                    <button className="stop-speak-btn" onClick={stopSpeaking} title="Stop Speaking">
                        🔇 Stop Audio
                    </button>
                )}
            </div>
            <div className="chat-messages">
                {messages.map(msg => (
                    <div key={msg.id} className={`message ${msg.role}`}>
                        <div className="message-content">
                            {msg.content}
                            {msg.role === 'assistant' && (
                                <button
                                    className="speak-msg-btn"
                                    onClick={() => speakText(msg.content)}
                                    title="Read Aloud"
                                >
                                    🔊
                                </button>
                            )}
                        </div>
                        <div className="message-time">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="message assistant">
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <div className="input-wrapper">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Message (${tone} mode)...`}
                        rows={1}
                    />
                    <button
                        className={`mic-btn ${isListening ? 'listening' : ''}`}
                        onClick={toggleListening}
                        title={isListening ? "Stop Listening" : "Voice Input"}
                    >
                        {isListening ? '🔴' : '🎤'}
                    </button>
                    <button
                        className="magic-btn"
                        onClick={() => setShowPromptGen(true)}
                        title="Enhance Prompt"
                    >
                        ✨
                    </button>
                </div>
                <button className="send-btn" onClick={handleSendMessage}>
                    Send
                </button>
            </div>

            {showPromptGen && (
                <PromptGenerator
                    type="text"
                    basePrompt={inputValue}
                    onClose={() => setShowPromptGen(false)}
                    onPromptGenerated={(prompt) => setInputValue(prompt)}
                />
            )}
        </div>
    );
};

export default ChatInterface;
