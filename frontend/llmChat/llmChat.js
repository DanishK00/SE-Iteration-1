let currentConvId = null;

document.getElementById("newBtn").addEventListener("click", async () => {
  const res = await fetch("/api/llm/new-conversation", { method: "POST" });
  const data = await res.json();
  currentConvId = data.conversationId;
  document.getElementById("messages").innerHTML = "";
  loadConversations();
});

document.getElementById("sendBtn").addEventListener("click", sendMessage);

async function sendMessage() {
  const input = document.getElementById("input");
  const message = input.value.trim();
  if (!currentConvId || !message) return alert("Start a chat first");

  document.getElementById("messages").innerHTML += `<div class="user">${message}</div>`;
  input.value = "";

  const res = await fetch("/api/llm/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId: currentConvId, message }),
  });

  const data = await res.json();
  document.getElementById("messages").innerHTML += `<div class="bot">${data.botResponse}</div>`;
}

async function loadConversations() {
  const res = await fetch("/api/llm/conversations");
  const data = await res.json();
  let html = "";
  data.conversations.forEach(conv => {
    html += `<div class="conv" onclick="loadConversation('${conv.id}')">${conv.id}</div>`;
  });
  document.getElementById("convList").innerHTML = html;
}

async function loadConversation(convId) {
  currentConvId = convId;
  const res = await fetch(`/api/llm/conversation/${convId}`);
  const data = await res.json();
  let html = "";
  data.messages.forEach(msg => {
    html += `<div class="${msg.role}">${msg.content}</div>`;
  });
  document.getElementById("messages").innerHTML = html;
}

document.getElementById("searchBtn").addEventListener("click", async () => {
  const term = document.getElementById("searchInput").value;
  if (!term) return;
  const res = await fetch("/api/llm/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ searchTerm: term }),
  });
  const data = await res.json();
  alert(`Found ${data.resultsCount} results`);
});

loadConversations();