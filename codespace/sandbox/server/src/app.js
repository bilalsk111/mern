import express from 'express';
import morgan from 'morgan';
import { createPod } from './kubernetes/pod.js';
import { createService } from './kubernetes/service.js';
import {v7 as uuidv7} from 'uuid';

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.get('/api/sandbox/health', (req, res) => {
  res.status(200).json({ message: 'sandbox is running smoothly', status: 'ok' });
});

app.post('/api/sandbox/start', async (req, res) => {
    const sandboxId = uuidv7();
    if (!sandboxId) {
        return res.status(400).json({ message: 'sandboxId is required' });
    }
  await Promise.all([
    createPod(sandboxId),
    createService(sandboxId)
  ]);
  res.status(201).json({ message: 'Sandbox environment created successfully', sandboxId,
    previewUrl: `http://${sandboxId}.preview.localhost`
   });
});

export default app;
