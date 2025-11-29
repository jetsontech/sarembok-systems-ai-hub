import type { Tool } from '../components/ToolCard';

export const tools: Tool[] = [
    // Featured Productivity
    {
        id: 'nexus-365',
        name: 'Nexus 365',
        description: '🚀 AI Command Center - Voice control, smart automation, real-time intelligence.',
        category: 'app',
        tags: ['Productivity', 'AI Assistant', 'Voice Control', 'Enterprise'],
        icon: '🎯',
        actionLink: '/tool/nexus-365',
        isNew: true
    },
    // Models
    {
        id: 'gemini-3',
        name: 'Gemini 3.0',
        description: 'Google\'s latest multimodal model with advanced reasoning capabilities.',
        category: 'model',
        tags: ['Multimodal', 'Reasoning', 'Google'],
        isNew: true,
        link: 'https://aistudio.google.com/'
    },
    {
        id: 'llama-3-2',
        name: 'Llama 3.2',
        description: 'Meta\'s open weights model, optimized for edge and cloud.',
        category: 'model',
        tags: ['Open Source', 'Meta', 'Text'],
        isNew: true
    },
    {
        id: 'phi-4',
        name: 'Phi-4',
        description: 'Microsoft\'s powerful small language model.',
        category: 'model',
        tags: ['SLM', 'Microsoft', 'Reasoning'],
        isNew: true
    },
    {
        id: 'mistral',
        name: 'Mistral',
        description: 'High-performance open models from Mistral AI.',
        category: 'model',
        tags: ['Open Source', 'Efficient']
    },
    {
        id: 'deepseek-coder',
        name: 'DeepSeek Coder',
        description: 'Specialized model for code generation and understanding.',
        category: 'model',
        tags: ['Coding', 'Open Source']
    },
    {
        id: 'gemma-2',
        name: 'Gemma 2',
        description: 'Google\'s lightweight open model family.',
        category: 'model',
        tags: ['Open Source', 'Google']
    },

    // Apps
    {
        id: 'google-ai-studio',
        name: 'Google AI Studio',
        description: 'Fastest way to build with Gemini models.',
        category: 'app',
        tags: ['Development', 'Prototyping'],
        link: 'https://aistudio.google.com/'
    },
    {
        id: 'nano-banana',
        name: 'Nano Banana (Gemini Image)',
        description: 'Advanced image generation and editing model by Google DeepMind.',
        category: 'app',
        tags: ['Creativity', 'Image Gen', 'Google'],
        isNew: true
    },
    {
        id: 'stable-diffusion',
        name: 'Stable Diffusion 3',
        description: 'Next generation text-to-image model.',
        category: 'app',
        tags: ['Creativity', 'Image Gen', 'Open Source'],
        isNew: true
    },
    {
        id: 'antigravity',
        name: 'Antigravity',
        description: 'Advanced agentic coding assistant by Google Deepmind.',
        category: 'app',
        tags: ['Coding', 'Agent'],
        isNew: true
    },
    {
        id: 'obsidian',
        name: 'Obsidian',
        description: 'Personal knowledge base with powerful AI plugins.',
        category: 'app',
        tags: ['Productivity', 'Notes']
    },
    {
        id: 'canvas',
        name: 'Google Canvas',
        description: 'Collaborative drawing and visualization tool.',
        category: 'app',
        tags: ['Creativity', 'Design']
    },
    {
        id: 'veo3',
        name: 'Veo 3',
        description: 'Next-gen product video generation.',
        category: 'app',
        tags: ['Video', 'Marketing'],
        link: 'https://www.youtube.com/watch?v=QTXSsrza9RU'
    },

    // Workflows
    {
        id: 'agent-playground',
        name: 'Agent Playground',
        description: 'Visual builder for multi-agent workflows.',
        category: 'workflow',
        tags: ['Automation', 'Visual', 'Agents'],
        isNew: true
    },
    {
        id: 'n8n',
        name: 'n8n',
        description: 'Workflow automation tool for connecting apps and AI.',
        category: 'workflow',
        tags: ['Automation', 'Low-code'],
        link: 'https://n8n.io'
    },
    {
        id: 'mcp-automation',
        name: 'MCP Automation',
        description: 'Standardized protocol for connecting AI assistants to local tools and data.',
        category: 'workflow',
        tags: ['Protocol', 'Integration', 'Open Source'],
        icon: '🔌',
        actionLink: 'https://modelcontextprotocol.io'
    },
    {
        id: 'openusd-nexus',
        name: 'OpenUSD Nexus',
        description: 'High-fidelity 3D asset database for Universal Scene Description pipelines.',
        category: '3D & Production',
        tags: ['3D', 'USD', 'Assets', 'Pipeline'],
        icon: '🧊',
        actionLink: '#'
    },
    {
        id: 'sceneforge-ai',
        name: 'SceneForge AI',
        description: 'Generative 3D scene builder with physics and lighting simulation.',
        category: '3D & Production',
        tags: ['Generative', '3D', 'Scene', 'Lighting'],
        icon: '🏗️',
        actionLink: '/tool/sceneforge-ai'
    },
    {
        id: 'replicate-studio',
        name: 'Replicate Studio',
        description: 'Universal AI Console. Run Video, Image, Audio, and Custom models from Replicate.',
        category: '3D & Production',
        tags: ['Video', 'Upscaling', 'Audio', 'Custom Models', 'Omni-Tool'],
        icon: '🌌',
        actionLink: '/tool/replicate-studio',
        isNew: true
    },
    {
        id: 'ad-velocity',
        name: 'AdVelocity Suite',
        description: 'The ultimate AI advertising production suite. Campaign -> Script -> Assets -> Final Cut.',
        category: '3D & Production',
        tags: ['Ad Tech', 'Video', 'Campaign', 'Professional'],
        icon: '🚀',
        actionLink: '/tool/ad-velocity',
        isNew: true
    },
    {
        id: 'juneteenth-editor',
        name: 'Juneteenth Editor',
        description: 'Edit and customize the Juneteenth vendor registration page with live preview.',
        category: '3D & Production',
        tags: ['Landing Page', 'Editor', 'Juneteenth', 'Events'],
        icon: '📄',
        actionLink: '/tool/juneteenth-editor',
        isNew: true
    }
];
