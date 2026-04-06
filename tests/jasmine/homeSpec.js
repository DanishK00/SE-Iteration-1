describe("Home page chat functionality", function() {
    beforeEach(function() {
        document.body.innerHTML = `
            <div id="chatBox"></div>
            <input id="messageInput" type="text" />
        `;
    });

    it("adds a message to the chat box", function() {
        document.getElementById("messageInput").value = "Hello!";
        sendMessage();
        expect(document.getElementById("chatBox").innerHTML).toContain("Hello!");
    });

    it("does not add empty messages", function() {
        document.getElementById("messageInput").value = "   ";
        sendMessage();
        expect(document.getElementById("chatBox").innerHTML).toBe("");
    });

    it("clears the input after sending", function() {
        document.getElementById("messageInput").value = "Test message";
        sendMessage();
        expect(document.getElementById("messageInput").value).toBe("");
    });
});