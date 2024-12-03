import express, {Application} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/users.js';

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(bodyParser.json());


app.use('/api/users', userRoutes);

export default app;