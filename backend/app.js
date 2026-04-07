const express = require("express");
const cors = require("cors");

const app = express();
const path = require("path");

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
    const response = await fetch("http://localhost:11434/api/generate", {   //ollana
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

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../docs/index.html"));
});