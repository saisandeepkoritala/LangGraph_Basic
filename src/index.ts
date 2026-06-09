import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { graphRouter } from './routes/graphRouter';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());  

app.use("/agent",graphRouter);

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});