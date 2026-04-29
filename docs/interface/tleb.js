console.log("NEW TLEB JS LOADED - OLLAMA VERSION");

const loggedInUser = localStorage.getItem("tlebLoggedInUser");

if (!loggedInUser) {
  window.location.href = "login.html";
}

const welcomeText = document.getElementById("welcomeText");
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const stopBtn = document.getElementById("stopBtn");
const clearChatBtn = document.getElementById("clearChatBtn");
const logoutBtn = document.getElementById("logoutBtn");
const darkModeBtn = document.getElementById("darkModeBtn");
const newChatBtn = document.getElementById("newChatBtn");
const chatList = document.getElementById("chatList");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const statusBadge = document.getElementById("statusBadge");

let typingInterval = null;
let currentChatId = localStorage.getItem("tlebCurrentChatId");

welcomeText.textContent = `Welcome, ${loggedInUser}`;

loadTheme();
setupChat();
renderChatList();

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

stopBtn.addEventListener("click", stopGenerating);

clearChatBtn.addEventListener("click", function () {
  const confirmClear = confirm("Are you sure you want to clear all chat history?");

  if (!confirmClear) {
    return;
  }

  stopGeneratingIfNeeded();

  localStorage.removeItem(getChatsKey());
  localStorage.removeItem("tlebCurrentChatId");

  currentChatId = createNewChat();
  localStorage.setItem("tlebCurrentChatId", currentChatId);

  clearChatBox();
  addMessageToBox("ai", "Chat history cleared. How can I help you now?");
  saveCurrentVisibleChat();
  renderChatList();
});

logoutBtn.addEventListener("click", function () {
  stopGeneratingIfNeeded();

  localStorage.removeItem("tlebLoggedInUser");
  localStorage.removeItem("tlebCurrentChatId");

  window.location.href = "login.html";
});

darkModeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("tlebTheme", isDark ? "dark" : "light");

  darkModeBtn.textContent = isDark ? "Light Mode" : "Dark Mode";
});

newChatBtn.addEventListener("click", function () {
  stopGeneratingIfNeeded();

  currentChatId = createNewChat();
  localStorage.setItem("tlebCurrentChatId", currentChatId);

  clearChatBox();
  addMessageToBox("ai", "New chat started. What do you want to ask?");
  saveCurrentVisibleChat();
  renderChatList();
});

searchBtn.addEventListener("click", function () {
  renderChatList(searchInput.value.trim());
});

searchInput.addEventListener("input", function () {
  renderChatList(searchInput.value.trim());
});

function sendMessage() {
  const userText = messageInput.value.trim();

  if (userText === "") {
    return;
  }

  if (typingInterval) {
    return;
  }

  addMessageToBox("user", userText);
  messageInput.value = "";

  saveCurrentVisibleChat();
  renderChatList();

  getRealAiResponse(userText);
}

async function getRealAiResponse(userText) {
  statusBadge.textContent = "Thinking...";
  sendBtn.disabled = true;
  stopBtn.disabled = false;

  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userText
      })
    });

    const data = await response.json();

    if (data.reply) {
      typeAiResponse(data.reply);
    } else if (data.error) {
      typeAiResponse("Error: " + data.error);
    } else {
      typeAiResponse("Sorry, I could not get a response from Ollama.");
    }
  } catch (error) {
    console.error("Frontend fetch error:", error);
    typeAiResponse("The backend is not connected. Make sure Ollama is running and npm start is running.");
  }
}

function typeAiResponse(text) {
  let index = 0;

  statusBadge.textContent = "Generating...";
  sendBtn.disabled = true;
  stopBtn.disabled = false;

  const row = document.createElement("div");
  row.className = "message-row ai";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = "";

  row.appendChild(bubble);
  chatBox.appendChild(row);

  typingInterval = setInterval(function () {
    bubble.textContent += text.charAt(index);
    index++;

    chatBox.scrollTop = chatBox.scrollHeight;

    if (index >= text.length) {
      finishGenerating();
      saveCurrentVisibleChat();
      renderChatList();
    }
  }, 20);
}

function stopGenerating() {
  if (!typingInterval) {
    statusBadge.textContent = "Stopped";
    sendBtn.disabled = false;
    stopBtn.disabled = true;
    return;
  }

  clearInterval(typingInterval);
  typingInterval = null;

  statusBadge.textContent = "Stopped";
  sendBtn.disabled = false;
  stopBtn.disabled = true;

  saveCurrentVisibleChat();
  renderChatList();
}

function stopGeneratingIfNeeded() {
  if (typingInterval) {
    clearInterval(typingInterval);
    typingInterval = null;
  }

  sendBtn.disabled = false;
  stopBtn.disabled = true;
}

function finishGenerating() {
  clearInterval(typingInterval);
  typingInterval = null;

  statusBadge.textContent = "Ready";
  sendBtn.disabled = false;
  stopBtn.disabled = true;
}

function addMessageToBox(sender, text) {
  const row = document.createElement("div");
  row.className = `message-row ${sender}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  row.appendChild(bubble);
  chatBox.appendChild(row);

  chatBox.scrollTop = chatBox.scrollHeight;
}

function clearChatBox() {
  chatBox.innerHTML = "";
}

function setupChat() {
  const chats = getChats();

  if (!currentChatId || !chats[currentChatId]) {
    currentChatId = createNewChat();
    localStorage.setItem("tlebCurrentChatId", currentChatId);
  }

  loadChat(currentChatId);
}

function createNewChat() {
  const chats = getChats();
  const id = "chat_" + Date.now();

  chats[id] = {
    title: "New Chat",
    messages: [
      {
        sender: "ai",
        text: "Welcome. How can I help you?"
      }
    ],
    createdAt: new Date().toLocaleString()
  };

  localStorage.setItem(getChatsKey(), JSON.stringify(chats));
  return id;
}

function loadChat(chatId) {
  const chats = getChats();
  const chat = chats[chatId];

  if (!chat) {
    return;
  }

  currentChatId = chatId;
  localStorage.setItem("tlebCurrentChatId", chatId);

  clearChatBox();

  chat.messages.forEach(function (message) {
    addMessageToBox(message.sender, message.text);
  });
}

function saveCurrentVisibleChat() {
  const chats = getChats();

  if (!currentChatId) {
    currentChatId = createNewChat();
    localStorage.setItem("tlebCurrentChatId", currentChatId);
  }

  const messages = [];

  document.querySelectorAll(".message-row").forEach(function (row) {
    const sender = row.classList.contains("user") ? "user" : "ai";
    const bubble = row.querySelector(".bubble");

    if (bubble) {
      messages.push({
        sender: sender,
        text: bubble.textContent
      });
    }
  });

  const firstUserMessage = messages.find(function (message) {
    return message.sender === "user";
  });

  chats[currentChatId] = {
    title: firstUserMessage ? firstUserMessage.text.slice(0, 28) : "New Chat",
    messages: messages,
    createdAt: chats[currentChatId]?.createdAt || new Date().toLocaleString()
  };

  localStorage.setItem(getChatsKey(), JSON.stringify(chats));
}

function renderChatList(searchTerm = "") {
  const chats = getChats();
  const chatIds = Object.keys(chats).reverse();

  chatList.innerHTML = "";

  const filteredIds = chatIds.filter(function (id) {
    const chat = chats[id];

    const allText = chat.messages
      .map(function (message) {
        return message.text;
      })
      .join(" ");

    return (
      chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      allText.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (filteredIds.length === 0) {
    chatList.innerHTML = `<p class="empty-text">No chats yet</p>`;
    return;
  }

  filteredIds.forEach(function (id) {
    const chat = chats[id];

    const item = document.createElement("div");
    item.className = "chat-item";

    const title = document.createElement("div");
    title.className = "chat-item-title";
    title.textContent = chat.title;

    const preview = document.createElement("div");
    preview.className = "chat-item-preview";
    preview.textContent = chat.createdAt;

    item.appendChild(title);
    item.appendChild(preview);

    item.addEventListener("click", function () {
      stopGeneratingIfNeeded();
      currentChatId = id;
      loadChat(id);
    });

    chatList.appendChild(item);
  });
}

function getChats() {
  return JSON.parse(localStorage.getItem(getChatsKey())) || {};
}

function getChatsKey() {
  return `tlebChats_${loggedInUser}`;
}

function loadTheme() {
  const savedTheme = localStorage.getItem("tlebTheme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    darkModeBtn.textContent = "Light Mode";
  } else {
    document.body.classList.remove("dark");
    darkModeBtn.textContent = "Dark Mode";
  }
}