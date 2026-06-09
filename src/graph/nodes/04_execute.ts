import { env } from '@/utils/env';
import { ChatOpenAI } from '@langchain/openai';
import {z} from 'zod';
import { State } from '../types';

const NotesSchema = z.object({
    notes : z.array(z.string().min(1).max(500)).min(1).max(20)
});

function getModel(){
    return new ChatOpenAI({
        apiKey : env.OPENAI_API_KEY,
        model : env.OPENAI_MODEL,
        temperature : 0.2
    })
};

function createHumanPrompt(steps : string[]){
    const list = JSON.stringify(steps,null,0);

    return [    
        'You are concise assistant',
        'Given a list of steps,return a JSON Object {notes : string[]}',
        'Rules :',
        'notes.length must be equals as steps.length',
        'Each note <=300 charcters',
        '',
        `Steps = ${list}`
    ].join("\n");
};

export async function excueteNode(state : State) : Promise<Partial<State>>{
    if(!state.approved) return {};

    const steps = state.steps ?? [];
    if(steps.length === 0) return {};

    const model = getModel().withStructuredOutput(NotesSchema);

    const output = await model.invoke([
        {
            role : 'system' , content : 'Return only valid JSON'
        },
        {
            role : 'human' , content : createHumanPrompt(steps)
        }
    ]);

    const count = Math.min(steps.length,output.notes.length);
    const results = Array.from({length:count},(_,i)=>({
        step : steps[i],
        note : output.notes[i]
    }));

    return {
        results,
        status:'done',
        message:`Excueted ${results.length} steps`
    }
};