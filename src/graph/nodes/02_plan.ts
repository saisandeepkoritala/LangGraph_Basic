import {z} from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { env } from '@/utils/env';
import { State } from '../types';

const PlanSchema = z.object({
    steps : z.array(z.string().min(3,'Provide bit more').max(150,'Keep it concise'))
    .min(1)
    .max(10) 
});

function getModel(){
    return new ChatOpenAI({
        apiKey : env.OPENAI_API_KEY,
        model : env.OPENAI_MODEL,
        temperature : 0.2
    })
};

const SYSTEM = [
    'You are a helpful planner',
    'Return only JSON that matches the schema',
    'Keep steps concrete, actionable and beginner friendly'
].join("\n");

function userPrompt(input : string){
    return [
        `User goal :${input}`,
        'Draft a small plan with 3-5 steps',
        'Each step is a short sentence'
    ].join("\n");
};

function takeFirstN(arr : string[], n=5) : string[]{
    return Array.isArray(arr) ? arr.slice(0,Math.max(0,n)) :  [];
}

export async function planNode(state : State) : Promise<Partial<State>>{
    if(state.status==='cancelled') return {};

    const model = getModel();

    const structuredModel = model.withStructuredOutput(PlanSchema);

    const response = await structuredModel.invoke([
        {
            role : 'system', content : SYSTEM
        },
        {
            role :  'human', content : userPrompt(state.input)
        }   
    ]);

    const steps = takeFirstN(response.steps,5);

    return {steps , status : 'planned'};
}