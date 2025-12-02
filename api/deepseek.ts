import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!DEEPSEEK_API_KEY) {
        return res.status(500).json({ error: 'DeepSeek API key not configured' });
    }

    try {
        const {
            messages,
            model = 'deepseek-chat',
            temperature = 1.0,
            max_tokens = 4096,
            stream = false
        } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model,
                messages,
                temperature,
                max_tokens,
                stream
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('DeepSeek API error:', error);
            return res.status(response.status).json({
                error: 'DeepSeek API request failed',
                details: error
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
