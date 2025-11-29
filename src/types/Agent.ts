export type AgentRole = 'RESEARCHER' | 'CODER' | 'ANALYST' | 'WRITER' | 'COORDINATOR';

export type AgentStatus = 'IDLE' | 'THINKING' | 'WORKING' | 'WAITING' | 'COMPLETED';

export interface Agent {
    id: string;
    name: string;
    role: AgentRole;
    capabilities: string[];
    status: AgentStatus;
    currentTask?: string;
    memory: string[];
    avatar?: string;
}

export interface AgentMessage {
    id: string;
    fromAgentId: string;
    toAgentId: string | 'ALL';
    content: string;
    timestamp: number;
    type: 'TASK_ASSIGNMENT' | 'TASK_UPDATE' | 'QUERY' | 'RESPONSE' | 'INFO';
}

export interface AgentTask {
    id: string;
    title: string;
    description: string;
    assignedTo?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    dependencies?: string[];
    subtasks?: AgentTask[];
}
