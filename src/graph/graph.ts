import {Annotation, Command, END, 
    MemorySaver, START, StateGraph} from '@langchain/langgraph'
import { validateNode } from './nodes/01_validate';
import { planNode } from './nodes/02_plan';
import { approveNode } from './nodes/03_approve';
import { excueteNode } from './nodes/04_execute';
import { finalizeNode } from './nodes/05_finalize';
import { makeInitialState, State } from './types';


const StateAnn = Annotation.Root({
    input : Annotation<string>,  // User input
    steps : Annotation<string[] | undefined>, // LLM generates steps for input
    approved : Annotation<boolean  | undefined>, // Did user approve or not ?
    results : Annotation<Array<{step:string; note:string}> |  undefined>, // excueted results  
    status : Annotation<'planned' | 'done' | 'cancelled' | undefined>, // status
    message :  Annotation<string |undefined> // final message
});


const builder = new StateGraph(StateAnn)
        .addNode("validate",validateNode)
        .addNode("plan",planNode)
        .addNode("approve",approveNode)
        .addNode("excuete",excueteNode)
        .addNode("finalize",finalizeNode);


builder.addEdge(START,'validate')
builder.addEdge('validate','plan')
builder.addEdge('plan','approve')

builder.addConditionalEdges('approve',(s : typeof StateAnn.State)=>{
    return s.approved ? 'excuete' : 'finalize'
})

builder.addEdge('excuete','finalize')
builder.addEdge('finalize',END)


const checkPointer = new MemorySaver();

const graph = builder.compile({
    checkpointer : checkPointer
});

function createThreadId(){
    return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
};

export async function startAgent(input: string): 
Promise<{ interrupt: { threadId: string; steps: string[] } } | { final: State }> 
{   
    const threadId = createThreadId();
    const config = { configurable: { thread_id: threadId } };
    
    // 1. Invoke the graph. It will pause automatically if a node (like approveNode) triggers an interrupt
    await graph.invoke(makeInitialState(input), config);

    // 2. Fetch the state after invocation to see if it's currently interrupted
    const state = await graph.getState(config);
    // 3. Check if there are any active tasks that are interrupted
    if (state.tasks && state.tasks.length > 0 && state.tasks[0].interrupts?.length > 0) {
        
        // Grab the first interrupt
        const firstInterrupt = state.tasks[0].interrupts[0];
        
        // Access your steps from the current state values
        const steps = (state.values.steps as string[]) ?? [];

        return {
            interrupt: {
                threadId,
                steps
            }
        };
    }

    // 4. If no interrupts, return the final state
    return {
        final: state.values as State
    };
}

export async function resumeAgent(args : {threadId:string; approve:boolean})
: Promise<State>
{
    const {threadId,approve} = args;
    const config = {configurable : {thread_id:threadId}};
    const finalState = await graph.invoke(
        new Command({resume:{approve}}),
        config
    ) as State;

    return finalState;
};