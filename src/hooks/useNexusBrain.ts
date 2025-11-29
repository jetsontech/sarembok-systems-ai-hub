import { useState, useCallback } from 'react';
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

    const processQuery = useCallback(async (query: string, options: QueryOptions = {}) => {
        setState(prev => ({ ...prev, isThinking: true, error: null }));

        try {
            // System prompt to give Nexus a personality
            const systemPrompt = `You are Nexus, an advanced AI operating system interface. 
            Keep responses concise, technical, and "Jarvis-like". 
            Do not use markdown formatting like bold or italics, just plain text.
            If asked to perform a system action, acknowledge it in character.`;

            // Prepare images for API
            const imageData = options.images?.map(img => ({
                data: img.data,
                mimeType: img.mimeType
            })) || [];

            // Call our serverless proxy
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `${systemPrompt}\n\nUser: ${query}`,
                    images: imageData,
                    model: 'gemini-2.0-flash-exp',
                    codeExecution: options.codeExecution || false,
                    functionCalling: options.functionCalling || false,
                    temperature: options.temperature ?? 1,
                    topK: options.topK ?? 40,
                    topP: options.topP ?? 0.95,
                    maxOutputTokens: options.maxOutputTokens ?? 8192,
                }),
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.response) {
                setState({
                    isThinking: false,
                    lastResponse: data.response,
                    error: null,
                    executableCode: data.executableCode,
                    codeExecutionResult: data.codeExecutionResult,
                    functionCall: data.functionCall,
                    functionResult: data.functionResult,
                    usage: data.usage,
                });
                return data.response;
            } else {
                throw new Error('No response from API');
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
