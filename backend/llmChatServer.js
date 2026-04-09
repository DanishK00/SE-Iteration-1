const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");
const app = express();

app.use(cors());
app.use(bodyParser.json());

// --- ROUTES ---

/**
 * POST /api/chat/llm
 * Body: { prompt: string }
 * Response: { response: string }
 */
app.post("/api/chat/llm", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: "Prompt is required." });
  }

  // Using Ollama: 'ollama run llama2'
  try {
    const ollama = spawn('ollama', ['run', 'llama3.2']);
    let output = "";
    let errorOccurred = false;

    ollama.stdout.on("data", (data) => {
      output += data.toString();
    });

    ollama.stderr.on("data", (data) => {
      errorOccurred = true;
      console.error(`Ollama error: ${data}`);
    });

    ollama.stdin.write(prompt + "\n");
    ollama.stdin.end();

    ollama.on("close", (code) => {
      if (errorOccurred) {
        return res.status(500).json({ message: "Error communicating with LLM service." });
      } else {
        console.log('Ollama output:', output); // <-- Add this for debugging
        return res.json({ response: output.trim() });
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Export the app for testing if needed
module.exports = app;

// Start server if run directly
if (require.main === module) {
  app.listen(4002, () => {
    console.log("LLM Chat backend running on port 4002");
  });
}