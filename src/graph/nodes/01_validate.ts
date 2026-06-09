import type {State} from '../types';

export async function validateNode(state : State) : Promise<Partial<State>>{
    const cleanInput = (state.input ?? "").trim();
    // If needed can do more checks for input
    if(cleanInput.length===0){
        return {
            status:"cancelled",
            message:"Input is empty. Please provide a task"
        }
    }

    const MAX = 300;
    const safeInput = cleanInput.length > 300 
    ? cleanInput.slice(0,MAX) + "..." : cleanInput;

    return {
        input : safeInput
    }

}