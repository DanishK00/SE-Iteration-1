
function sendMessage() {
    let input = document.getElementById("messageInput");
    let message = input.value;

    if (message.trim() === "") return;

    let chatBox = document.getElementById("chatBox");
    let msg = document.createElement("p");
    msg.innerHTML = `<strong>You:</strong> ${message}`;
    chatBox.appendChild(msg);

    
    chatBox.scrollTop = chatBox.scrollHeight;
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


document.getElementById("messageInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") sendMessage();
});