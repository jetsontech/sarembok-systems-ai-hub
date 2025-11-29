import { multiAgentOrchestrator } from '../services/multi-agent-orchestrator';
import { AgentTask } from '../types/Agent';

export const runDemoScenario = (scenarioId: string) => {
    let task: AgentTask;

    switch (scenarioId) {
        case 'research':
            task = {
                id: Math.random().toString(36).substr(2, 9),
                title: 'Research Quantum Computing Trends',
                description: 'Conduct deep research on current quantum computing advancements and prepare a summary report.',
                status: 'PENDING',
                priority: 'HIGH'
            };
            break;
        case 'code':
            task = {
                id: Math.random().toString(36).substr(2, 9),
                title: 'Refactor Authentication Module',
                description: 'Review and refactor the legacy auth module to improve security and performance.',
                status: 'PENDING',
                priority: 'CRITICAL'
            };
            break;
        case 'creative':
            task = {
                id: Math.random().toString(36).substr(2, 9),
                title: 'Draft Product Launch Blog Post',
                description: 'Write a compelling blog post for the new AI feature launch, focusing on user benefits.',
                status: 'PENDING',
                priority: 'MEDIUM'
            };
            break;
        default:
            return;
    }

    multiAgentOrchestrator.assignTask(task);
};
