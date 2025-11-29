import React, { createContext, useContext, useState, useEffect } from 'react';

export interface HistoryItem {
    id: string;
    type: 'chat' | 'image' | 'video' | 'scene';
    content: string; // Text prompt, image URL, or scene name
    timestamp: number;
    metadata?: any; // Extra data like model name, settings, etc.
}

interface HistoryContextType {
    history: HistoryItem[];
    addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
    clearHistory: () => void;
    isOpen: boolean;
    toggleHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load history from local storage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('sarembok_history');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse history', e);
            }
        }
    }, []);

    // Save history to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('sarembok_history', JSON.stringify(history));
    }, [history]);

    const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        const newItem: HistoryItem = {
            ...item,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        setHistory((prev) => [newItem, ...prev]); // Add to beginning
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const toggleHistory = () => setIsOpen((prev) => !prev);

    return (
        <HistoryContext.Provider value={{ history, addToHistory, clearHistory, isOpen, toggleHistory }}>
            {children}
        </HistoryContext.Provider>
    );
};

export const useHistory = () => {
    const context = useContext(HistoryContext);
    if (context === undefined) {
        throw new Error('useHistory must be used within a HistoryProvider');
    }
    return context;
};
