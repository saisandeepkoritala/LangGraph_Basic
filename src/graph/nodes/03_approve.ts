import { interrupt } from '@langchain/langgraph';
import { State } from '../types';

export async function approveNode(state: State): Promise<Partial<State>> {
    if (state.status === 'cancelled') return {};

    const steps = state.steps ?? [];
    if (steps.length === 0) {
        return {
            approved: true,
            message: 'No Steps to approve'
        };
    }
    // This triggers the pause. When resumeAgent calls graph.invoke, 
    // whatever you passed to { resume: value } becomes the return value of this function call.
    const decision = interrupt({
        type: 'approval_request',
        steps
    }) as any; 

    let approved: boolean;

    if (decision && typeof decision === 'object' && 'approve' in decision) {
        approved = !!(decision.approve);
    } 
    else {
        approved = !!(decision);
    }

    return {
        approved
    };
}