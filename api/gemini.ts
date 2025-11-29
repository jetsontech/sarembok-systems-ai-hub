import type { VercelRequest, VercelResponse } from '@vercel/node';

// Function definitions for function calling
const functions = [
    {
        name: 'get_weather',
        description: 'Get the current weather for a location',
        parameters: {
            type: 'object',
            properties: {
                location: {
                    type: 'string',
                    description: 'The city and state, e.g. San Francisco, CA',
                },
                unit: {
                    type: 'string',
                    enum: ['celsius', 'fahrenheit'],
                    description: 'The temperature unit',
                },
            },
            required: ['location'],
        },
    },
    {
        name: 'calculate',
        description: 'Perform mathematical calculations',
        parameters: {
            type: 'object',
            properties: {
                expression: {
                    type: 'string',
                    description: 'The mathematical expression to evaluate',
                },
            },
            required: ['expression'],
        },
    },
];

// Execute function calls
function executeFunction(functionCall: any) {
    const { name, args } = functionCall;

    switch (name) {
        case 'get_weather':
            // Simulated weather data
            return {
                location: args.location,
                temperature: 72,
                unit: args.unit || 'fahrenheit',
                conditions: 'Partly cloudy',
                humidity: 65,
            };

        case 'calculate':
            try {
                // Safe eval for simple math (in production, use a proper math parser)
                const result = Function(`'use strict'; return (${args.expression})`)();
                return { expression: args.expression, result };
            } catch (error) {
                return { error: 'Invalid expression' };
            }

        default:
            return { error: 'Unknown function' };
    }
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse,
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get API key from environment variable
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const {
            prompt,
            images = [],
            model = 'gemini-2.0-flash-exp',
            stream = false,
            codeExecution = false,
            functionCalling = false,
            temperature = 1,
            topK = 40,
            topP = 0.95,
            maxOutputTokens = 8192,
        } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Build content parts (text + images)
        const parts: any[] = [{ text: prompt }];

        // Add images if provided (base64 encoded)
        if (images && images.length > 0) {
            for (const image of images) {
                parts.push({
                    inline_data: {
                        mime_type: image.mimeType || 'image/jpeg',
                        data: image.data, // base64 string
                    },
                });
            }
        }

        // Build generation config
        const generationConfig: any = {
            temperature,
            topK,
            topP,
            maxOutputTokens,
        };

        // Add code execution if enabled
        if (codeExecution) {
            generationConfig.code_execution = {};
        }

        // Build request body
        const requestBody: any = {
            contents: [{ parts }],
            generationConfig,
        };

        // Add function declarations if enabled
        if (functionCalling) {
            requestBody.tools = [
                {
                    function_declarations: functions,
                },
            ];
        }

        // Call Gemini API
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Gemini API error:', error);
            return res.status(response.status).json({
                error: 'Gemini API request failed',
                details: error
            });
        }

        const data = await response.json();

        // Check for function calls
        const candidate = data.candidates?.[0];
        const functionCall = candidate?.content?.parts?.find((p: any) => p.functionCall);

        if (functionCall) {
            // Execute the function
            const functionResult = executeFunction(functionCall.functionCall);

            // Make a second call with the function result
            const followUpResponse = await fetch(geminiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        { parts },
                        {
                            parts: [
                                {
                                    functionCall: functionCall.functionCall,
                                },
                            ],
                        },
                        {
                            parts: [
                                {
                                    functionResponse: {
                                        name: functionCall.functionCall.name,
                                        response: functionResult,
                                    },
                                },
                            ],
                        },
                    ],
                    generationConfig,
                    tools: requestBody.tools,
                }),
            });

            const followUpData = await followUpResponse.json();
            const finalText = followUpData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

            return res.status(200).json({
                response: finalText,
                model,
                usage: followUpData.usageMetadata,
                functionCall: functionCall.functionCall,
                functionResult,
            });
        }

        // Extract text and code execution results
        const textPart = candidate?.content?.parts?.find((p: any) => p.text);
        const codeExecutionPart = candidate?.content?.parts?.find((p: any) => p.executableCode || p.codeExecutionResult);

        const text = textPart?.text || 'No response generated';
        const executableCode = codeExecutionPart?.executableCode;
        const codeExecutionResult = codeExecutionPart?.codeExecutionResult;

        return res.status(200).json({
            response: text,
            model,
            usage: data.usageMetadata,
            executableCode,
            codeExecutionResult,
        });

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
