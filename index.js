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
    origin: "http://localhost:3000", // Adjust this to match the domain of your frontend app
    methods: ["GET", "POST", "OPTIONS"], // Specify methods allowed for CORS
    allowedHeaders: ["Content-Type", "Authorization"], // Specify headers allowed for CORS
  })
);

// Proxy configuration
const proxyOptions = {
  target: "https://api.runloop.ai", // Target host
  changeOrigin: true, // Needed for virtual hosted sites
  pathRewrite: {
    "^/deepgram-transcribe":
      "/v1/projects/1714679056570/functions/deepgram_transcription/invoke_nonblocking",
  },
};

// Apply the proxy middleware for paths starting with /deepgram-transcribe
app.use("/deepgram-transcribe", createProxyMiddleware(proxyOptions));

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
