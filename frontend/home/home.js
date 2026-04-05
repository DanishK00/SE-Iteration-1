function sendMessage() {
    let input = document.getElementById("messageInput");
    let message = input.value;

    if (message.trim() === "") return;

    let chatBox = document.getElementById("chatBox");

    chatBox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;

    input.value = "";

    chatBox.scrollTop = chatBox.scrollHeight;
}