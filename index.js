const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const axios = require("axios");
const app = express();
const https = require("https");

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

// Add this line to use express.json middleware
app.use(express.json());

// Proxy configuration for /deepgram-transcribe
const proxyOptions = {
  target: "https://api.runloop.ai",
  changeOrigin: true,
  pathRewrite: {
    "^/deepgram-transcribe":
      "/v1/projects/1714679056570/functions/deepgram_transcription/invoke_nonblocking",
  },
};

const anotherProxyOption = {
  target: "https://api.runloop.ai",
  changeOrigin: true,
  pathRewrite: {
    "^/generate-attio":
      "/v1/projects/1714679056570/functions/generate_attio/invoke_nonblocking",
  },
  proxyTimeout: 900000,
};

// Apply the proxy middleware for POST requests to /deepgram-transcribe
app.post("/deepgram-transcribe", createProxyMiddleware(proxyOptions));

app.post("/generate_attio", (req, res) => {
  console.log("THE REQUEST IS", req.body);
  axios({
    method: "post",
    url: `https://api.runloop.ai/v1/projects/1714679056570/functions/generate_attio/invoke_nonblocking`,
    data: req.body,
    headers: {
      "Content-Type": req.headers["content-type"],
      Authorization: req.headers["authorization"],
      // include other necessary headers here
    },
  })
    .then((response) => {
      console.log("response", "response", response.data);
      res.status(200).send("Request sent");
    })
    .catch((error) => {
      console.log("THE ERROR IS", error);
      res.status(500).send("Error sending request");
    });
});

// app.post("/scheduler", (req, res) => {
//   const data = JSON.stringify(req.body);

//   const options = {
//     hostname: "api.runloop.ai",
//     path: "/v1/projects/1714679056570/functions/transcription_scheduler/invoke_nonblocking",
//     method: "POST",
//     rejectUnauthorized: false,
//     headers: {
//       "Content-Type": "application/json",
//       "Content-Length": Buffer.byteLength(data),
//       ...req.headers, // Forward all incoming headers
//     },
//   };

//   // Create the request to the external server
//   const proxyReq = https.request(options, (proxyRes) => {
//     // Optionally log the status code for debugging
//     console.log(`RESPONSE: ${proxyRes}`);

//     console.log(`STATUS: ${proxyRes.statusCode}`);
//   });

//   proxyReq.on("error", (e) => {
//     console.error(`Problem with request: ${e.message}`);
//   });

//   // Write data to request body and end the request
//   proxyReq.write(data);
//   proxyReq.end();

//   // Immediately respond to the client without waiting for the external request to complete
//   res.status(202).send("Request is being processed");
// });

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
