const express = require("express");
const cors = require("cors");
const path = require("path");


const app = express();

app.use(express.static(path.join(__dirname, "../docs")));
app.use(express.json());
app.use(cors());

app.post("/signup", (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  return res.status(200).json({ message: "Account created successfully." });
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3",
        prompt: userMessage,
        stream: false
      })
    });

    const data = await response.json();

    res.json({ reply: data.response });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error talking to Ollama" });
  }
});

app.post("/api/llm/query", async (req, res) => {
  const { prompt, models } = req.body;

  if (!prompt || !models) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const results = await Promise.all(models.map(async (model) => {
    try {
      const response = await fetch("http://localhost:11434/api/generate", { //multi llm
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false
        })
      });

      const data = await response.json();

      return {
        modelName: model,
        status: "success",
        response: data.response
      };

    } catch (error) {
      return {
        modelName: model,
        status: "failed",
        error: error.message
      };
    }
  }));

  res.json(results);
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../docs/index.html"));
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});