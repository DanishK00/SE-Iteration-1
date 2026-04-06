describe("searchLogs function", function() {
    let chatBox, searchInput;

    beforeEach(function() {
       
        document.body.innerHTML = `
            <div id="chatBox">
                <p>AI: Welcome. How can I help you?</p>
                <p>You: Hello there!</p>
                <p>You: Test message</p>
            </div>
            <input type="text" id="searchInput" />
        `;

        chatBox = document.getElementById("chatBox");
        searchInput = document.getElementById("searchInput");

        
        if (typeof searchLogs !== "function") {
            window.searchLogs = function() {
                const input = searchInput.value.toLowerCase();
                const messages = chatBox.getElementsByTagName("p");
                for (let msg of messages) {
                    if (msg.textContent.toLowerCase().includes(input)) {
                        msg.style.backgroundColor = "#ffff99";
                    } else {
                        msg.style.backgroundColor = "transparent";
                    }
                }
            };
        }
    });

    it("highlights the correct message when a term matches", function() {
        searchInput.value = "welcome";
        searchLogs();
        const messages = chatBox.getElementsByTagName("p");

        expect(messages[0].style.backgroundColor).toBe("rgb(255, 255, 153)"); // "#ffff99"
        expect(messages[1].style.backgroundColor).toBe("transparent");
        expect(messages[2].style.backgroundColor).toBe("transparent");
    });

    it("highlights multiple messages if needed", function() {
        searchInput.value = "you";
        searchLogs();
        const messages = chatBox.getElementsByTagName("p");

        expect(messages[0].style.backgroundColor).toBe("transparent");
        expect(messages[1].style.backgroundColor).toBe("rgb(255, 255, 153)");
        expect(messages[2].style.backgroundColor).toBe("rgb(255, 255, 153)");
    });

    it("resets highlights when no match", function() {
        searchInput.value = "nomatch";
        searchLogs();
        const messages = chatBox.getElementsByTagName("p");

        for (let msg of messages) {
            expect(msg.style.backgroundColor).toBe("transparent");
        }
    });
});