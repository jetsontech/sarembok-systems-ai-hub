import { multiAgentOrchestrator } from './services/multi-agent-orchestrator';
import { AgentTask } from './types/Agent';

console.log('Starting Multi-Agent Logic Test...');

// Subscribe to updates
multiAgentOrchestrator.subscribe(({ type, payload }) => {
    if (type === 'MESSAGE_ADDED') {
        const msg = payload;
        console.log(`\n[${msg.fromAgentId} -> ${msg.toAgentId}]: ${msg.content}`);
    } else if (type === 'AGENT_UPDATED') {
        // console.log(`[Agent Update] ${payload.name}: ${payload.status}`);
        if (payload.memory.length > 0) {
            const lastMemory = payload.memory[payload.memory.length - 1];
            console.log(`[Thought - ${payload.name}]: ${lastMemory}`);
        }
    } else if (type === 'TASK_UPDATED' && payload.status === 'COMPLETED') {
        console.log('\nTask Completed!');
        process.exit(0);
    }
});

// Create a task
const task: AgentTask = {
    id: 'test-task-1',
    title: 'Explain Quantum Entanglement',
    description: 'Provide a simple explanation of quantum entanglement for a 5th grader.',
    status: 'PENDING',
    priority: 'HIGH'
};

console.log('Assigning Task:', task.title);
multiAgentOrchestrator.assignTask(task);

// Keep alive
setTimeout(() => {
    console.log('Timeout reached, exiting...');
    process.exit(1);
}, 30000);
