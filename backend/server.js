const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL_NAME = "llama3.2";

app.use(cors());
app.use(express.json());

app.get("/", function (req, res) {
  res.send("TLEB backend is running with Ollama.");
});

app.post("/api/chat", async function (req, res) {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({
        error: "No message was provided."
      });
    }

    console.log("Received message:", userMessage);

    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          {
            role: "system",
            content: "You are TLEB, a helpful AI assistant."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        stream: false
      })
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error("Ollama error:", errorText);

      return res.status(500).json({
        error: "Ollama returned an error."
      });
    }

    const data = await ollamaResponse.json();

    res.json({
      reply: data.message.content
    });
  } catch (error) {
    console.error("Backend error:", error);

    res.status(500).json({
      error: "Could not connect to Ollama. Make sure Ollama is running."
    });
  }
});

app.listen(PORT, function () {
  console.log(`TLEB backend running at http://localhost:${PORT}`);
});