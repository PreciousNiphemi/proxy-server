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

app.post("/post_attio", async (req, res) => {
  console.log("THE REQUEST IS", req.body);
  try {
    const response = await axios({
      method: "post",
      url: `https://api.runloop.ai/v1/projects/1714679056570/functions/post_attio_json/invoke_blocking`,
      data: req.body,
      headers: {
        "Content-Type": req.headers["content-type"],
        Authorization: req.headers["authorization"],
        // include other necessary headers here
      },
    });
    console.log("response", response.data);
    res.status(200).json(response.data); // send the response data back to the client
  } catch (error) {
    console.log("THE ERROR IS", error);
    res.status(500).send("Error sending request");
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
