
async function sendMessage() {
    let input = document.getElementById("messageInput");
    let message = input.value;

    if (message.trim() === "") return;

    let chatBox = document.getElementById("chatBox");


    chatBox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;

    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: message })
        });

        const data = await response.json();

 
        chatBox.innerHTML += `<p><strong>AI:</strong> ${data.reply}</p>`;

    } catch (error) {
        chatBox.innerHTML += `<p><strong>AI:</strong> Error getting response</p>`;
        console.error(error);
    }

    saveChatToStorage();
    saveCurrentSession();
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("messageInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
});

document.getElementById("logoutBtn").addEventListener("click", function() {
    window.location.href = "../login/index.html";
});

function saveChatToStorage() {
    const messages = document.getElementById("chatBox").innerHTML;
    localStorage.setItem("chatHistory", messages);
}

function loadChatFromStorage() {
    const chatBox = document.getElementById("chatBox");
    const saved = localStorage.getItem("chatHistory");

    if (saved) {
        chatBox.innerHTML = saved;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function searchLogs() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const messages = document.getElementById("chatBox").getElementsByTagName("p");

    for (let msg of messages) {
        if (msg.textContent.toLowerCase().includes(input)) {
            msg.style.backgroundColor = "#ffff99";
        } else {
            msg.style.backgroundColor = "transparent";
        }
    }
}

function saveCurrentSession() {
    const chatBox = document.getElementById("chatBox");
    const session = chatBox.innerHTML;

    let sessions = JSON.parse(localStorage.getItem("chatSessions") || "[]");

    sessions.push({
        timestamp: new Date().toLocaleString(),
        content: session
    });

    localStorage.setItem("chatSessions", JSON.stringify(sessions));

    renderOldLogs();
}

function renderOldLogs() {
    const container = document.getElementById("oldLogsContainer");
    if (!container) return;

    container.innerHTML = "";

    let sessions = JSON.parse(localStorage.getItem("chatSessions") || "[]");

    sessions.forEach((session, index) => {
        const div = document.createElement("div");
        div.classList.add("old-log-item");
        div.textContent = `Session ${index + 1} - ${session.timestamp}`;
        div.onclick = () => loadSession(index);
        container.appendChild(div);
    });
}

function loadSession(index) {
    const sessions = JSON.parse(localStorage.getItem("chatSessions") || "[]");

    if (sessions[index]) {
        document.getElementById("chatBox").innerHTML = sessions[index].content;
    }
}

function clearChat() {
    const chatBox = document.getElementById("chatBox");

    chatBox.innerHTML = `<p><strong>AI:</strong> Welcome. How can I help you?</p>`;

    localStorage.removeItem("chatHistory");

    localStorage.removeItem("chatSessions");
}

document.getElementById("clearChatBtn").addEventListener("click", clearChat); 

loadChatFromStorage();
renderOldLogs();