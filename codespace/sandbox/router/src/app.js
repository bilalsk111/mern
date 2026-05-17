import express from "express";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(morgan("combined"));

// 1. HEALTH CHECKS SABSE PEHLE
app.get("/api/status/healthz", (req, res) => res.status(200).send("ok"));
app.get("/api/status/readyz", (req, res) => res.status(200).send("ready"));

const proxies = {};
const agentProxies = {};

// Vite frontend ke liye proxy (Port 80/5173 on cluster)
function getProxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}.default.svc.cluster.local`;
  if (!proxies[sandboxId]) {
    proxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
      // pathRewrite: { "^/": "/" },
      logLevel: "debug",
      onError: (err, req, res) => {
        res.status(502).send("Vite Frontend not reachable.");
      },
    });
  }
  return proxies[sandboxId];
}

// Agent Node API ke liye proxy (Port 3000)
function getAgentProxy(sandboxId) {
  const target = `http://sandbox-service-${sandboxId}.default.svc.cluster.local:3000`;
  if (!agentProxies[sandboxId]) { 
    agentProxies[sandboxId] = createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
      // pathRewrite: { "^/": "/" },
      logLevel: "debug",
      onError: (err, req, res) => {
        res.status(502).send("Agent API not reachable.");
      },
    });
  }
  return agentProxies[sandboxId];
}

// 2. ROUTING MIDDLEWARE
app.use((req, res, next) => {
  const host = req.headers.host || "";
  // Strip port: "019e35a5.agent.localhost:3001" → "019e35a5.agent.localhost"
  const hostname = host.split(":")[0];
  const parts = hostname.split(".");

  // parts[0] = sandboxId, parts[1] = "agent" | "preview", parts[2] = "localhost"
  const sandboxId = parts[0];
  const routeType = parts[1]; // "agent" or "preview"

  if (req.path.startsWith("/api/sandbox")) {
    return next();
  }

  const excluded = ["preview", "agent", "localhost", "api"];
  if (sandboxId && !excluded.includes(sandboxId) && isNaN(sandboxId)) {
    if (routeType === "agent") {
      console.log("Routing to Agent for sandbox:", sandboxId);
      return getAgentProxy(sandboxId)(req, res, next);
    }
    if (routeType === "preview") {
      return getProxy(sandboxId)(req, res, next);
    }
  }

  res.status(404).send("Route or Sandbox Not Found");
});

export default app;