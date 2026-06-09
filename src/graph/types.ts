import {z} from 'zod';
//GRAPH = STATE + NODES + EDGES

export const ExcuetionStatus = z.enum(['planned','done','cancelled']);
export type ExcuetionStatusT = z.infer<typeof  ExcuetionStatus>;

export const StepResult = z.object({
    step : z.string(),
    note : z.string()
});

export const StateSchema = z.object({
    input : z.string().min(5,'input is needed'),
    steps : z.array(z.string()).optional(),
    approved : z.boolean().optional(),
    results : z.array(StepResult).optional(),
    status : ExcuetionStatus.optional(),
    message :  z.string().optional()
});

export type State = z.infer<typeof StateSchema>;

export function makeInitialState(input : string) : State {
    return {
        input,
        status:'planned'
    }
};