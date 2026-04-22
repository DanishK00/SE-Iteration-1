const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Models available in Ollama — make sure these are pulled locally
// Run: ollama pull llama3 / ollama pull mistral / ollama pull gemma
const AVAILABLE_MODELS = ["llama3", "mistral", "gemma"];

/**
 * Helper: Send a single prompt to one Ollama model.
 * Returns { model, response } on success or { model, error } on failure.
 */
async function queryModel(model, prompt) {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      return {
        model,
        error: `Ollama returned status ${response.status} for model "${model}".`,
      };
    }

    const data = await response.json();
    return { model, response: data.response };
  } catch (err) {
    return {
      model,
      error: `Failed to reach Ollama for model "${model}": ${err.message}`,
    };
  }
}

/**
 * GET /api/chat/models
 * Returns the list of available LLM models the user can choose from.
 */
app.get("/api/chat/models", (req, res) => {
  return res.status(200).json({ models: AVAILABLE_MODELS });
});

/**
 * POST /api/chat/multi
 * Body:    { prompt: string, models: string[] }
 * Returns: { results: [{ model: string, response?: string, error?: string }] }
 *
 * Queries all selected models simultaneously using Promise.all.
 * If one model fails, others still return their responses.
 */
app.post("/api/chat/multi", async (req, res) => {
  const { prompt, models } = req.body;

  // --- Validation ---
  if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
    return res.status(400).json({ message: "Prompt is required." });
  }

  if (!models || !Array.isArray(models) || models.length === 0) {
    return res.status(400).json({ message: "At least one model must be selected." });
  }

  // Filter out any model names not in the allowed list
  const validModels = models.filter((m) => AVAILABLE_MODELS.includes(m));
  if (validModels.length === 0) {
    return res.status(400).json({
      message: `No valid models selected. Available models: ${AVAILABLE_MODELS.join(", ")}.`,
    });
  }

  // --- Query all selected models in parallel ---
  try {
    const results = await Promise.all(
      validModels.map((model) => queryModel(model, prompt.trim()))
    );
    return res.status(200).json({ results });
  } catch (err) {
    console.error("Unexpected error in /api/chat/multi:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Export app for Jasmine/Supertest unit tests
module.exports = { app, queryModel, AVAILABLE_MODELS };

// Start server only if run directly (not during tests)
if (require.main === module) {
  app.listen(4003, () => {
    console.log("Multi-LLM Chat backend running on http://localhost:4003");
  });
}