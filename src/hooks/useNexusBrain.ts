import { useState, useCallback } from 'react';
import { aiOrchestrator } from '../services/ai-orchestrator';
import type { UploadedImage } from '../components/ImageUpload';

interface BrainState {
    isThinking: boolean;
    lastResponse: string | null;
    error: string | null;
    executableCode?: string;
    codeExecutionResult?: any;
    functionCall?: any;
    functionResult?: any;
    usage?: any;
}

interface QueryOptions {
    images?: UploadedImage[];
    codeExecution?: boolean;
    functionCalling?: boolean;
    temperature?: number;
    topK?: number;
    topP?: number;
    maxOutputTokens?: number;
}

export const useNexusBrain = () => {
    const [state, setState] = useState<BrainState>({
        isThinking: false,
        lastResponse: null,
        error: null
    });

    const processQuery = useCallback(async (query: string, _options: QueryOptions = {}) => {
        setState(prev => ({ ...prev, isThinking: true, error: null }));

        try {
            // System prompt for Nexus persona
            const systemPrompt = `You are Nexus, an advanced AI operating system interface. Keep responses concise, technical, and "Jarvis-like". Do not use markdown formatting like bold or italics, just plain text. If asked to perform a system action, acknowledge it in character.`;

            // Use AI Orchestrator for flexible model selection
            const result = await aiOrchestrator.chat(query, systemPrompt);

            if (!result.success) {
                throw new Error(result.error || 'AI request failed');
            }

            const responseText = result.data;

            if (responseText) {
                setState({
                    isThinking: false,
                    lastResponse: responseText,
                    error: null,
                });
                return responseText;
            } else {
                throw new Error('No response from AI');
            }
        } catch (error) {
            setState({
                isThinking: false,
                lastResponse: null,
                error: String(error)
            });
            return "I'm unable to process that request at the moment.";
        }
    }, []);

    return {
        ...state,
        processQuery
    };
};
