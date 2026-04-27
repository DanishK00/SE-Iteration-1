const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

let conversations = [];
let convId = 1;

// Call Ollama
const callOllama = async (message) => {
  const response = await axios.post("http://localhost:11434/api/generate", {
    model: "llama2",
    prompt: message,
    stream: false,
  });

  return response.data.response;
};

// New conversation
app.post("/api/llm/new-conversation", (req, res) => {
  const id = `conv_${convId++}`;
  conversations.push({ id, messages: [], createdAt: new Date() });
  console.log("Created conversation:", id);
  res.status(201).json({ conversationId: id });
});

// Send message
app.post("/api/llm/chat", async (req, res) => {
  const { conversationId, message } = req.body;

  console.log("Received chat request:", { conversationId, message });

  if (!conversationId || !message || message.trim() === "") {
    return res.status(400).json({ message: "Invalid input." });
  }

  const conv = conversations.find((c) => c.id === conversationId);
  if (!conv) {
    return res.status(404).json({ message: "Conversation not found." });
  }

  try {
    const botResponse = await callOllama(message);

    conv.messages.push({ role: "user", content: message });
    conv.messages.push({ role: "bot", content: botResponse });

    console.log("Bot response:", botResponse);

    res.status(200).json({ userMessage: message, botResponse });
  } catch (error) {
    console.error("Ollama error:", error.response?.data || error.message);
    res.status(500).json({
      message: "Error processing message.",
      error: error.response?.data || error.message,
    });
  }
});

// Get one conversation
app.get("/api/llm/conversation/:conversationId", (req, res) => {
  const conv = conversations.find((c) => c.id === req.params.conversationId);

  if (!conv) {
    return res.status(404).json({ message: "Conversation not found." });
  }

  res.status(200).json({
    conversationId: conv.id,
    messages: conv.messages,
  });
});

// Get all conversations
app.get("/api/llm/conversations", (req, res) => {
  const list = conversations.map((c) => ({
    id: c.id,
    messageCount: c.messages.length,
    preview: c.messages.length > 0 ? c.messages[0].content.substring(0, 50) : "Empty",
  }));

  res.status(200).json({ conversations: list });
});

// Search
app.post("/api/llm/search", (req, res) => {
  const { searchTerm } = req.body;

  if (!searchTerm) {
    return res.status(400).json({ message: "Search term required." });
  }

  const results = [];

  conversations.forEach((conv) => {
    conv.messages.forEach((msg) => {
      if (msg.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({
          conversationId: conv.id,
          message: msg.content,
          role: msg.role,
        });
      }
    });
  });

  res.status(200).json({ resultsCount: results.length, results });
});

module.exports = app;

if (require.main === module) {
  app.listen(3001, () => {
    console.log("LLM Chat server running on port 3001");
  });
}