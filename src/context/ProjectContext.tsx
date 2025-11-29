import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface CreationHistoryItem {
    id: string;
    name: string;
    type: 'landing-page' | 'ad-campaign' | 'video' | 'image' | 'other';
    url?: string;
    timestamp: string;
    description?: string;
}

interface ProjectContextType {
    projectName: string;
    setProjectName: (name: string) => void;
    contextDescription: string;
    setContextDescription: (desc: string) => void;
    tone: string;
    setTone: (tone: string) => void;
    creationHistory: CreationHistoryItem[];
    addToHistory: (item: Omit<CreationHistoryItem, 'id' | 'timestamp'>) => void;
    removeFromHistory: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [projectName, setProjectName] = useState('New Project');
    const [contextDescription, setContextDescription] = useState('');
    const [tone, setTone] = useState('Professional');
    const [creationHistory, setCreationHistory] = useState<CreationHistoryItem[]>([
        {
            id: 'ai-hub-prod',
            name: 'AI Apps Hub (Live)',
            type: 'other',
            url: 'https://ai-173j5o31k-jets-projects-a83f6733.vercel.app',
            timestamp: new Date().toISOString(),
            description: 'Production deployment on Vercel'
        },
        {
            id: 'juneteenth-static',
            name: 'Juneteenth Vendor Registration',
            type: 'landing-page',
            url: 'https://ai-173j5o31k-jets-projects-a83f6733.vercel.app/juneteenth-vendor-registration/index.html',
            timestamp: new Date().toISOString(),
            description: 'Vendor registration page for Atlanta Juneteenth festival'
        }
    ]);

    const addToHistory = (item: Omit<CreationHistoryItem, 'id' | 'timestamp'>) => {
        const newItem: CreationHistoryItem = {
            ...item,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
        };
        setCreationHistory(prev => [newItem, ...prev]);
    };

    const removeFromHistory = (id: string) => {
        setCreationHistory(prev => prev.filter(item => item.id !== id));
    };

    return (
        <ProjectContext.Provider value={{
            projectName,
            setProjectName,
            contextDescription,
            setContextDescription,
            tone,
            setTone,
            creationHistory,
            addToHistory,
            removeFromHistory
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider');
    }
    return context;
};
