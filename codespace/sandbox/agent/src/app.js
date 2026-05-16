import express from 'express';
import morgan from 'morgan';
import fs from 'fs';

const app = express();
app.use(morgan('dev'));
app.use(express.json());


app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello from the agent!',status:'success' });
});

const WORKSPACE_DIR = '/workspace';

app.get('/list-files',async (req, res) => {
 const elem = await fs.promises.readdir(WORKSPACE_DIR);
 res.status(200).json({ 
    message: 'Files in workspace directory',
    status: 'success',
   elem 
});
})

export default app;