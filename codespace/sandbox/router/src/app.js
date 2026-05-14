import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(morgan('combined'));

// Health Checks
app.get('/api/status/healthz', (req, res) => res.status(200).send('ok'));
app.get('/api/status/readyz', (req, res) => res.status(200).send('ready'));

const proxies = {};

function getProxy(sandboxId) {
    // Target must point to the specific service created by your backend
    const target = `http://sandbox-service-${sandboxId}.default.svc.cluster.local`; 

    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
            ws: true,
            logLevel: 'debug',
            onError: (err, req, res) => {
                console.error(`Proxy Error for ${sandboxId}:`, err.message);
                res.status(502).send("Sandbox not reachable. Is it still starting?");
            }
        });
    }
    return proxies[sandboxId];
}

app.use((req, res, next) => {
    const host = req.headers.host;
    const sandboxId = host.split('.')[0];

    // 1. Agar health check request hai, toh bypass karein
    if (req.path.startsWith('/api/status')) {
        return next();
    }

    // 2. Sandbox traffic handle karein
    if (sandboxId && sandboxId !== 'preview' && sandboxId !== 'localhost') {
        return getProxy(sandboxId)(req, res, next);
    } 

    res.status(400).json({ message: 'Invalid sandbox ID' });
});

export default app;