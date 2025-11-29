import type { Agent, AgentMessage, AgentTask, AgentStatus } from '../types/Agent';

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

        // Simulate coordinator analyzing task
        await this.simulateAgentAction('coordinator-1', 'Analyzing new task request...');

        const bestAgent = this.findBestAgentForTask(task);
        if (bestAgent) {
            await this.simulateAgentAction('coordinator-1', `Assigning task to ${bestAgent.name}`);
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

            // Simulate agent accepting and working
            setTimeout(async () => {
                await this.simulateAgentAction(bestAgent.id, `Starting work on: ${task.title}`);
                this.updateAgentStatus(bestAgent.id, 'THINKING');

                // Simulate work completion after random delay
                setTimeout(() => {
                    this.completeTask(task.id, bestAgent.id);
                }, 5000 + Math.random() * 5000);
            }, 1000);
        }
    }

    private findBestAgentForTask(task: AgentTask): Agent | undefined {
        // Simple logic: match role based on keywords in title/description
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

    private completeTask(taskId: string, agentId: string) {
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
                content: `Task Completed: ${task.title}. Results are ready for review.`,
                timestamp: Date.now(),
                type: 'TASK_UPDATE'
            };
            this.addMessage(completionMsg);
        }
    }
}

export const multiAgentOrchestrator = new MultiAgentOrchestrator();
