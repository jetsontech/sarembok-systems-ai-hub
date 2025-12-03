/**
 * AI Orchestrator Service
 * Manages all AI model integrations with smart fallbacks and zero-cost optimization
 */

export interface AIModel {
    name: string;
    endpoint: 'pollinations' | 'gemini' | 'huggingface' | 'local' | 'deepseek';
    dailyLimit: number;
    quality: 'premium' | 'high' | 'good';
    speed: 'fast' | 'medium' | 'slow';
}

export interface GenerationRequest {
    type: 'script' | 'image' | 'video' | 'voice' | 'music';
    prompt: string;
    options?: Record<string, any>;
}

export interface GenerationResult {
    success: boolean;
    data?: any;
    model: string;
    error?: string;
}

class AIOrchestrator {
    private usageTracking: Map<string, number> = new Map();
    private lastResetDate: string = new Date().toDateString();

    /**
     * Free model configurations
     */
    private models = {
        script: [
            { name: 'Pollinations AI', endpoint: 'pollinations' as const, dailyLimit: Infinity, quality: 'high' as const, speed: 'fast' as const },
            { name: 'Gemini 2.0 Flash', endpoint: 'gemini' as const, dailyLimit: Infinity, quality: 'premium' as const, speed: 'fast' as const },
            { name: 'DeepSeek Chat', endpoint: 'deepseek' as const, dailyLimit: Infinity, quality: 'premium' as const, speed: 'fast' as const },
        ],
        image: [
            { name: 'Pollinations FLUX', endpoint: 'pollinations' as const, dailyLimit: Infinity, quality: 'premium' as const, speed: 'fast' as const },
            { name: 'SDXL', endpoint: 'huggingface' as const, dailyLimit: 50, quality: 'high' as const, speed: 'medium' as const },
        ],
        voice: [
            { name: 'Bark TTS', endpoint: 'huggingface' as const, dailyLimit: 100, quality: 'high' as const, speed: 'medium' as const },
        ],
        music: [
            { name: 'MusicGen', endpoint: 'huggingface' as const, dailyLimit: 30, quality: 'high' as const, speed: 'slow' as const },
        ],
    };

    /**
     * Reset usage tracking daily
     */
    private checkAndResetUsage() {
        const today = new Date().toDateString();
        if (today !== this.lastResetDate) {
            this.usageTracking.clear();
            this.lastResetDate = today;
        }
    }

    /**
     * Get available model for request type
     */
    private getAvailableModel(type: keyof typeof this.models): AIModel | null {
        this.checkAndResetUsage();

        const modelsForType = this.models[type];

        for (const model of modelsForType) {
            const usage = this.usageTracking.get(model.name) || 0;
            if (usage < model.dailyLimit) {
                return model;
            }
        }

        return null;
    }

    /**
     * Track model usage
     */
    private trackUsage(modelName: string) {
        const current = this.usageTracking.get(modelName) || 0;
        this.usageTracking.set(modelName, current + 1);
    }

    /**
     * Generic Chat/Completion for Nexus 365
     */
    async chat(message: string, systemPrompt?: string): Promise<GenerationResult> {
        let model = this.getAvailableModel('script'); // Reuse script models for chat

        if (!model) {
            return { success: false, model: 'none', error: 'Daily limit reached' };
        }

        const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${message}` : message;

        try {
            let data;
            if (model.endpoint === 'gemini') {
                data = await this.callGeminiProxy(message, systemPrompt);
            } else if (model.endpoint === 'deepseek') {
                data = await this.callDeepSeek(message, systemPrompt);
            } else if (model.endpoint === 'pollinations') {
                data = await this.callPollinationsText(fullPrompt);
            }

            this.trackUsage(model.name);
            return { success: true, data, model: model.name };
        } catch (error) {
            console.error(`Chat failed with ${model.name}:`, error);

            // Try fallback to Pollinations if primary failed
            if (model.endpoint !== 'pollinations') {
                console.log('Attempting fallback to Pollinations...');
                const fallbackModel = this.models.script.find(m => m.endpoint === 'pollinations');
                if (fallbackModel) {
                    try {
                        const data = await this.callPollinationsText(fullPrompt);
                        this.trackUsage(fallbackModel.name);
                        return { success: true, data, model: fallbackModel.name };
                    } catch (fallbackError) {
                        console.error('Fallback failed:', fallbackError);
                    }
                }
            }

            return { success: false, model: model.name, error: String(error) };
        }
    }

    /**
     * Generate script using best available free model
     */
    async generateScript(campaignData: {
        productName: string;
        audience: string;
        mood: string;
        platform: string;
        productUrl?: string;
    }): Promise<GenerationResult> {
        const model = this.getAvailableModel('script');

        if (!model) {
            return { success: false, model: 'none', error: 'Daily limit reached for all script models' };
        }

        const prompt = this.buildScriptPrompt(campaignData);

        try {
            let data;

            if (model.endpoint === 'gemini') {
                data = await this.callGeminiProxy(prompt, "You are a world-class creative director.");
            } else if (model.endpoint === 'deepseek') {
                data = await this.callDeepSeek(prompt, "You are a world-class creative director.");
            } else if (model.endpoint === 'pollinations') {
                data = await this.callPollinationsText(prompt);
            }

            this.trackUsage(model.name);
            return { success: true, data, model: model.name };
        } catch (error) {
            console.error(`${model.name} failed:`, error);

            // Try next available model
            const nextModel = this.models.script.find(m => m.name !== model.name);
            if (nextModel) {
                try {
                    let data;
                    if (nextModel.endpoint === 'gemini') {
                        data = await this.callGeminiProxy(prompt, "You are a world-class creative director.");
                    } else if (nextModel.endpoint === 'deepseek') {
                        data = await this.callDeepSeek(prompt, "You are a world-class creative director.");
                    } else {
                        data = await this.callPollinationsText(prompt);
                    }

                    this.trackUsage(nextModel.name);
                    return { success: true, data, model: nextModel.name };
                } catch (fallbackError) {
                    return { success: false, model: nextModel.name, error: String(fallbackError) };
                }
            }

            return { success: false, model: model.name, error: String(error) };
        }
    }

    /**
     * Generate image using best available free model
     */
    async generateImage(prompt: string, options?: { seed?: number }): Promise<GenerationResult> {
        const model = this.getAvailableModel('image');

        if (!model) {
            return { success: false, model: 'none', error: 'Daily limit reached for all image models' };
        }

        try {
            let data;

            if (model.endpoint === 'pollinations') {
                data = await this.callPollinationsImage(prompt, options?.seed);
            } else if (model.endpoint === 'huggingface') {
                data = await this.callHuggingFaceImage(prompt);
            }

            this.trackUsage(model.name);
            return { success: true, data, model: model.name };
        } catch (error) {
            console.error(`${model.name} failed:`, error);
            return { success: false, model: model.name, error: String(error) };
        }
    }

    /**
     * Build optimized script prompt with agency-grade techniques
     */
    private buildScriptPrompt(campaign: any): string {
        // Build W+K/Droga5 style prompt with psychographic data
        const emotionalGuidance = campaign.emotionalCore
            ? `\nEMOTIONAL CORE: ${campaign.emotionalCore} - Make viewers feel ${campaign.emotionalCore}.`
            : '';

        const humanTruthGuidance = campaign.humanTruth
            ? `\nHUMAN TRUTH: Tap into this fundamental truth: "${campaign.humanTruth}"`
            : '';

        const painPointGuidance = campaign.painPoint
            ? `\nPAIN POINT: Address this fear/concern: "${campaign.painPoint}"`
            : '';

        const purchaserGuidance = campaign.realPurchaser
            ? `\nREAL PURCHASER: Remember, ${campaign.realPurchaser} - target THEM, not just the user.`
            : '';

        return `You are a world-class creative director at Wieden+Kennedy or Droga5.

CAMPAIGN BRIEF:
- Product: ${campaign.productName}
- Target Audience: ${campaign.audience}${purchaserGuidance}
- Mood/Vibe: ${campaign.mood}
- Platform: ${campaign.platform}${emotionalGuidance}${humanTruthGuidance}${painPointGuidance}

CREATIVE DIRECTION (W+K & Droga5 Techniques):
1. TRANSCEND THE PRODUCT - Don't sell features, tell a HUMAN story
   - Nike doesn't sell shoes, they sell "unleashing your potential"
   - Old Spice doesn't sell deodorant, they sell "confidence"
   - Coca-Cola doesn't sell soda, they sell "shared moments of joy"

2. HOOK IN 3 SECONDS - First scene must be visceral and unexpected
   - Start with emotion, not explanation
   - Make it impossible to look away

3. EMOTIONAL ARC - Take viewers on a journey
   - Hook (3s): Grab attention with emotion/surprise
   - Conflict (10s): Show the struggle/desire/aspiration
   - Resolution (12s): Product as the key to transformation
   - CTA (5s): Memorable, actionable, inspiring

4. AUTHENTIC MOMENTS - Droga5 style
   - Feel real, not scripted
   - Oblique storytelling (hint, don't tell)
   - Capture genuine human emotion

5. BOLD CHOICES - W+K style
   - Take creative risks
   - Be provocative if appropriate
   - Make it award-worthy

FORMAT (4 scenes, 30 seconds total):
Scene 1 (3-5s): [HOOK] Visual + Audio
Scene 2 (8-10s): [CONFLICT] Visual + Audio  
Scene 3 (10-12s): [RESOLUTION] Visual + Audio
Scene 4 (5-7s): [CTA] Visual + Audio

Make it Super Bowl quality. Make it memorable. Make it HUMAN.`;
    }

    /**
     * Call Gemini Proxy API
     */
    private async callGeminiProxy(message: string, systemPrompt?: string): Promise<string> {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${message}` : message;

        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: fullPrompt,
                model: 'gemini-2.0-flash-exp',
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.response;
    }

    /**
     * Call DeepSeek API
     */
    private async callDeepSeek(message: string, systemPrompt?: string): Promise<any> {
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: message });

        const response = await fetch('/api/deepseek', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model: 'deepseek-chat',
                temperature: 0.7,
                max_tokens: 4096
            }),
        });

        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    /**
     * Call Pollinations.ai text generation (unlimited free)
     */
    private async callPollinationsText(prompt: string): Promise<any> {
        try {
            // Try the streaming endpoint first (more reliable)
            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: 'You are Nexus, an advanced AI assistant. Be helpful, concise, and intelligent.' },
                        { role: 'user', content: prompt }
                    ],
                    model: 'openai',
                    seed: 42,
                    jsonMode: false
                }),
            });

            if (!response.ok) {
                throw new Error(`Pollinations API error: ${response.status} ${response.statusText}`);
            }

            const text = await response.text();

            // Try to parse as JSON first (new Pollinations format)
            try {
                const json = JSON.parse(text);
                // Extract message content from OpenAI-compatible format
                if (json.choices && json.choices[0]?.message?.content) {
                    return json.choices[0].message.content;
                }
                if (json.response) {
                    return json.response;
                }
                // Fallback to raw text if not in expected format
                return text;
            } catch {
                // If not JSON, return as-is (streaming format)
                return text.trim();
            }
        } catch (error) {
            console.error('Pollinations API failed:', error);
            throw error;
        }
    }

    /**
     * Call Pollinations.ai image generation (unlimited free, FLUX-based)
     */
    private async callPollinationsImage(prompt: string, seed?: number): Promise<string> {
        // Pollinations.ai uses a simple URL-based API
        const enhancedPrompt = `${prompt}, cinematic lighting, professional photography, 8k, ultra detailed, award-winning`;
        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        const seedParam = seed ? `&seed=${seed}` : '';

        return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1920&height=1080&nologo=true${seedParam}`;
    }

    /**
     * Call HuggingFace Inference API (free tier)
     */
    private async callHuggingFaceImage(prompt: string): Promise<Blob> {
        const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN;

        const response = await fetch(
            'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(HF_TOKEN ? { 'Authorization': `Bearer ${HF_TOKEN}` } : {}),
                },
                body: JSON.stringify({
                    inputs: `${prompt}, cinematic, professional, 8k`,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`HuggingFace API error: ${response.statusText}`);
        }

        return response.blob();
    }

    /**
     * Get usage statistics
     */
    getUsageStats() {
        return {
            date: this.lastResetDate,
            usage: Object.fromEntries(this.usageTracking),
            limits: {
                gemini: 1500,
                pollinations: '∞',
                huggingface: 100,
            },
        };
    }
}

// Export singleton instance
export const aiOrchestrator = new AIOrchestrator();
