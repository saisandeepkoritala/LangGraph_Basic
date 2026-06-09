import {z} from 'zod';
import {Router} from 'express';
import { resumeAgent, startAgent } from '@/graph/graph';

export const graphRouter = Router();


const startSchema = z.object({
    input : z.string().min(1,'Input needed').max(300)
});

const approveSchema = z.object({
    threadId : z.string().min(1,'ThreadId is needed'),
    approve : z.boolean()
});

graphRouter.post("/",async(req,res)=>{
    const parsed = startSchema.safeParse(req.body);
    if(!parsed.success){
        return res.status(400).json({
            status:'Error',
            Error:'Error while parsing info'
        })
    }
    try{
        const result = await startAgent(parsed.data.input);

        if('final' in result){
            return res.status(200).json({
                status:"ok",
                data:{
                    kind:'final',
                    final:result.final
                }
            })
        }
        if('interrupt' in result){
            return res.status(200).json({
                status:'ok',
                data:{
                    kind:'needs_approval',
                    interrupt:{
                        threadId : result.interrupt.threadId,
                        steps :  result.interrupt.steps,
                        prompt : 'Approve the generated plan to Excuete or Reject'
                    }
                }
            })
        }

        return res.status(500).json({
            status : 'error',
            error : 'Some error occured'
        })
    }
    catch(e){
         return res.status(500).json({
            status : 'error!!',
            error : 'Some error occured'
        })
    }
});


graphRouter.post("/approve",async(req,res)=>{
    try{    
        const parsed = approveSchema.safeParse(req.body);
        if(!parsed.success){
        return res.status(400).json({
            status:'Error',
            Error:'Error while parsing info'
        })
        }

        const {threadId,approve} = parsed.data;

        const final = await resumeAgent({threadId,approve});

        return res.status(200).json({
            status:"ok",
            data:{
                kind:"final",
                final:final
            }
        });

    }
    catch(e){
        return res.status(500).json({
            status : 'error!!',
            error : 'Some error occured'
        })
    }
})