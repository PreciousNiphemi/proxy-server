const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");

const app = express();

// Middleware to log all incoming requests
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// Apply CORS middleware to handle preflight checks and set headers
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://app.wallycopilot.com",
      "https://app.hellomedassist.com",
      "https://app.hellovetassist.com",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Proxy configuration for /deepgram-transcribe
const proxyOptions = {
  target: "https://api.runloop.ai",
  changeOrigin: true,
  pathRewrite: {
    "^/deepgram-transcribe":
      "/v1/projects/1714679056570/functions/deepgram_transcription/invoke_blocking",
  },
};

// Apply the proxy middleware for POST requests to /deepgram-transcribe
app.post("/deepgram-transcribe", createProxyMiddleware(proxyOptions));

// New proxy configuration for the additional endpoint
const soapProxyOptions = {
  target: "https://api.runloop.ai", // Replace with the target host for the new endpoint
  changeOrigin: true,
  pathRewrite: {
    "^/scheduler":
      "/v1/projects/1714679056570/functions/generate_code/invoke_blocking", // Replace with the actual path on the target server
  },
};

// Apply the proxy middleware for POST requests to /another-endpoint
app.post("/scheduler", createProxyMiddleware(soapProxyOptions));

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
