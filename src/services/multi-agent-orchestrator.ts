import type { Agent, AgentMessage, AgentTask, AgentStatus } from '../types/Agent';
import { aiOrchestrator } from './ai-orchestrator';

class MultiAgentOrchestrator {
    private agents: Agent[] = [];
    private messages: AgentMessage[] = [];
    private tasks: AgentTask[] = [];
    private listeners: ((data: { type: string; payload: any }) => void)[] = [];

    constructor() {
        this.initializeDefaultAgents();
    }

    private initializeDefaultAgents() {
        this.agents = [
            {
                id: 'coordinator-1',
                name: 'Nexus Core',
                role: 'COORDINATOR',
                capabilities: ['Task Management', 'Resource Allocation', 'System Integration'],
                status: 'IDLE',
                memory: [],
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nexus'
            },
            {
                id: 'researcher-1',
                name: 'Deep Search',
                role: 'RESEARCHER',
                capabilities: ['Data Mining', 'Fact Checking', 'Trend Analysis'],
                status: 'IDLE',
                memory: [],
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Search'
            },
            {
                id: 'coder-1',
                name: 'Dev Bot',
                role: 'CODER',
                capabilities: ['Full Stack Dev', 'Code Review', 'Debugging'],
                status: 'IDLE',
                memory: [],
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Dev'
            },
            {
                id: 'analyst-1',
                name: 'Logic Engine',
                role: 'ANALYST',
                capabilities: ['Data Analysis', 'Pattern Recognition', 'Optimization'],
                status: 'IDLE',
                memory: [],
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Logic'
            },
            {
                id: 'writer-1',
                name: 'Creative Spark',
                role: 'WRITER',
                capabilities: ['Content Generation', 'Copywriting', 'Storytelling'],
                status: 'IDLE',
                memory: [],
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Creative'
            }
        ];
    }

    public spawnAgent() {
        const roles = ['RESEARCHER', 'CODER', 'ANALYST', 'WRITER'] as const;
        const randomRole = roles[Math.floor(Math.random() * roles.length)];
        const id = Math.random().toString(36).substr(2, 9);

        const newAgent: Agent = {
            id: `agent-${id}`,
            name: `Nexus ${randomRole.charAt(0) + randomRole.slice(1).toLowerCase()} ${id.substr(0, 3)}`,
            role: randomRole,
            capabilities: ['General Intelligence', 'Task Execution'],
            status: 'IDLE',
            memory: [],
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`
        };

        this.agents.push(newAgent);
        this.notify('AGENT_UPDATED', newAgent);
        return newAgent;
    }

    public getAgents(): Agent[] {
        return this.agents;
    }

    public getMessages(): AgentMessage[] {
        return this.messages;
    }

    public getTasks(): AgentTask[] {
        return this.tasks;
    }

    public subscribe(listener: (data: { type: string; payload: any }) => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify(type: string, payload: any) {
        this.listeners.forEach(l => l({ type, payload }));
    }

    public async assignTask(task: AgentTask) {
        this.tasks.push(task);
        this.notify('TASK_ADDED', task);

        // Coordinator analyzes task using AI
        await this.simulateAgentAction('coordinator-1', 'Analyzing task requirements and complexity...');

        // Ask AI to pick the best agent
        const agentSelectionPrompt = `
            You are the Coordinator of an elite AI team.
            Team Members:
            - Deep Search (RESEARCHER): Data mining, fact checking, trends.
            - Dev Bot (CODER): Full stack dev, code review, debugging.
            - Logic Engine (ANALYST): Data analysis, patterns, optimization.
            - Creative Spark (WRITER): Content generation, copywriting.

            Task: "${task.title}" - ${task.description}

            Which agent should handle this? Reply ONLY with the exact ID: researcher-1, coder-1, analyst-1, or writer-1.
        `;

        const selectionResult = await aiOrchestrator.chat(agentSelectionPrompt);
        const bestAgentId = selectionResult.success ? selectionResult.data.trim() : this.findBestAgentForTask(task)?.id;
        const bestAgent = this.agents.find(a => a.id === bestAgentId) || this.agents.find(a => a.role === 'COORDINATOR');

        if (bestAgent) {
            await this.simulateAgentAction('coordinator-1', `Selected ${bestAgent.name} for this task.`);
            this.updateAgentStatus(bestAgent.id, 'WORKING');

            const assignmentMsg: AgentMessage = {
                id: Math.random().toString(36).substr(2, 9),
                fromAgentId: 'coordinator-1',
                toAgentId: bestAgent.id,
                content: `Task Assigned: ${task.title}. Priority: ${task.priority}`,
                timestamp: Date.now(),
                type: 'TASK_ASSIGNMENT'
            };
            this.addMessage(assignmentMsg);

            // Agent accepts and works
            setTimeout(async () => {
                await this.simulateAgentAction(bestAgent.id, `Analyzing task: ${task.title}`);
                this.updateAgentStatus(bestAgent.id, 'THINKING');

                // Generate initial thoughts
                const thoughtPrompt = `
                    You are ${bestAgent.name}, a ${bestAgent.role}.
                    Task: ${task.title}
                    Generate a brief, technical internal thought about how you will approach this.
                    Keep it under 1 sentence.
                `;
                const thoughtResult = await aiOrchestrator.chat(thoughtPrompt);
                if (thoughtResult.success) {
                    await this.simulateAgentAction(bestAgent.id, thoughtResult.data);
                }

                // Perform the work (Simulated delay, then AI generation)
                setTimeout(async () => {
                    const workPrompt = `
                        You are ${bestAgent.name}, a ${bestAgent.role}.
                        Task: ${task.title} - ${task.description}
                        
                        Perform this task. Provide a concise but complete result/output.
                        If it's code, provide the code snippet.
                        If it's research, provide key bullet points.
                        Keep it professional and high quality.
                    `;

                    const workResult = await aiOrchestrator.chat(workPrompt);
                    const finalOutput = workResult.success ? workResult.data : "Task completed successfully.";

                    this.completeTask(task.id, bestAgent.id, finalOutput);
                }, 8000); // 8 seconds to "work"
            }, 1000);
        }
    }

    private findBestAgentForTask(task: AgentTask): Agent | undefined {
        // Fallback logic
        const text = (task.title + ' ' + task.description).toLowerCase();
        if (text.includes('code') || text.includes('bug') || text.includes('app')) return this.agents.find(a => a.role === 'CODER');
        if (text.includes('research') || text.includes('find') || text.includes('search')) return this.agents.find(a => a.role === 'RESEARCHER');
        if (text.includes('write') || text.includes('content') || text.includes('post')) return this.agents.find(a => a.role === 'WRITER');
        if (text.includes('analyze') || text.includes('data') || text.includes('report')) return this.agents.find(a => a.role === 'ANALYST');
        return this.agents.find(a => a.role === 'COORDINATOR');
    }

    private async simulateAgentAction(agentId: string, action: string) {
        const agent = this.agents.find(a => a.id === agentId);
        if (!agent) return;

        // Add internal thought to memory
        agent.memory.push(`${new Date().toISOString()}: ${action}`);
        this.notify('AGENT_UPDATED', agent);
    }

    private updateAgentStatus(agentId: string, status: AgentStatus) {
        const agent = this.agents.find(a => a.id === agentId);
        if (agent) {
            agent.status = status;
            this.notify('AGENT_UPDATED', agent);
        }
    }

    private addMessage(message: AgentMessage) {
        this.messages.push(message);
        this.notify('MESSAGE_ADDED', message);
    }

    private completeTask(taskId: string, agentId: string, result: string) {
        const task = this.tasks.find(t => t.id === taskId);
        const agent = this.agents.find(a => a.id === agentId);

        if (task && agent) {
            task.status = 'COMPLETED';
            this.notify('TASK_UPDATED', task);

            this.updateAgentStatus(agentId, 'IDLE');

            const completionMsg: AgentMessage = {
                id: Math.random().toString(36).substr(2, 9),
                fromAgentId: agentId,
                toAgentId: 'coordinator-1',
                content: `Task Completed. Result:\n\n${result}`,
                timestamp: Date.now(),
                type: 'TASK_UPDATE'
            };
            this.addMessage(completionMsg);
        }
    }
}

export const multiAgentOrchestrator = new MultiAgentOrchestrator();
