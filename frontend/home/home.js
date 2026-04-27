const API_BASE = "http://localhost:3001";
let currentConvId = null;
let currentController = null;
let isGenerating = false;

// Theme setup
window.addEventListener("load", async () => {
  loadTheme();
  await startNewChat();
});

document.getElementById("themeToggleBtn").addEventListener("click", toggleTheme);

// Logout button goes back to landing page
document.getElementById("logoutBtn").addEventListener("click", () => {
  window.location.href = "../index.html";
});

// New Chat button
document.getElementById("newChatBtn").addEventListener("click", async () => {
  if (isGenerating && currentController) {
    currentController.abort();
  }
  await startNewChat();
});

// Send button
document.getElementById("sendBtn").addEventListener("click", sendMessage);

// Stop button
document.getElementById("stopBtn").addEventListener("click", () => {
  if (currentController) {
    currentController.abort();
  }
});

// Optional: press Enter to send
document.getElementById("messageInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendMessage();
  }
});

// Clear visible chat
document.getElementById("clearChatBtn").addEventListener("click", () => {
  document.getElementById("chatBox").innerHTML = `
    <div class="message bot-message">
      <span class="label">AI</span>
      <p>Welcome. How can I help you?</p>
    </div>
  `;
});

function loadTheme() {
  const savedTheme = localStorage.getItem("tlebTheme") || "light";
  document.body.setAttribute("data-theme", savedTheme);
  updateThemeButton(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.body.setAttribute("data-theme", newTheme);
  localStorage.setItem("tlebTheme", newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const btn = document.getElementById("themeToggleBtn");
  btn.textContent = theme === "light" ? "Dark Mode" : "Light Mode";
}

function setGeneratingState(generating) {
  isGenerating = generating;
  document.getElementById("sendBtn").style.display = generating ? "none" : "inline-block";
  document.getElementById("stopBtn").style.display = generating ? "inline-block" : "none";
  document.getElementById("messageInput").disabled = generating;
}

async function startNewChat() {
  try {
    const res = await fetch(`${API_BASE}/api/llm/new-conversation`, {
      method: "POST"
    });

    const data = await res.json();
    currentConvId = data.conversationId;

    document.getElementById("chatBox").innerHTML = `
      <div class="message bot-message">
        <span class="label">AI</span>
        <p>Welcome. How can I help you?</p>
      </div>
    `;

    loadConversations();
  } catch (error) {
    console.error("Error creating conversation:", error);
    appendBotMessage("Error starting chat.");
  }
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const message = input.value.trim();

  if (!currentConvId || !message || isGenerating) return;

  appendUserMessage(message);
  input.value = "";

  currentController = new AbortController();
  setGeneratingState(true);

  try {
    const res = await fetch(`${API_BASE}/api/llm/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        conversationId: currentConvId,
        message
      }),
      signal: currentController.signal
    });

    const data = await res.json();
    appendBotMessage(data.botResponse || data.message || "No response");
    loadConversations();
  } catch (error) {
    if (error.name === "AbortError") {
      appendBotMessage("Generation stopped.");
    } else {
      console.error("Error sending message:", error);
      appendBotMessage("Error getting response.");
    }
  } finally {
    setGeneratingState(false);
    currentController = null;
  }
}

async function loadConversations() {
  try {
    const res = await fetch(`${API_BASE}/api/llm/conversations`);
    const data = await res.json();

    const history = document.getElementById("chatHistory");

    if (!data.conversations || data.conversations.length === 0) {
      history.innerHTML = `<div class="history-placeholder">No chats yet</div>`;
      return;
    }

    history.innerHTML = "";
    data.conversations.forEach((conv) => {
      const item = document.createElement("div");
      item.className = "history-item";
      item.textContent = `${conv.id} - ${conv.preview}`;
      item.addEventListener("click", () => loadConversation(conv.id));
      history.appendChild(item);
    });
  } catch (error) {
    console.error("Error loading conversations:", error);
  }
}

async function loadConversation(convId) {
  try {
    currentConvId = convId;

    const res = await fetch(`${API_BASE}/api/llm/conversation/${convId}`);
    const data = await res.json();

    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    data.messages.forEach((msg) => {
      if (msg.role === "user") {
        appendUserMessage(msg.content);
      } else {
        appendBotMessage(msg.content);
      }
    });
  } catch (error) {
    console.error("Error loading conversation:", error);
  }
}

async function searchLogs() {
  const term = document.getElementById("searchInput").value.trim();
  if (!term) return;

  try {
    const res = await fetch(`${API_BASE}/api/llm/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ searchTerm: term })
    });

    const data = await res.json();
    alert(`Found ${data.resultsCount} matching message(s).`);
  } catch (error) {
    console.error("Search error:", error);
    alert("Search failed.");
  }
}

function appendUserMessage(text) {
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML += `
    <div class="message user-message">
      <span class="label">You</span>
      <p>${text}</p>
    </div>
  `;
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendBotMessage(text) {
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML += `
    <div class="message bot-message">
      <span class="label">AI</span>
      <p>${text}</p>
    </div>
  `;
  chatBox.scrollTop = chatBox.scrollHeight;
}