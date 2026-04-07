const request = require("supertest");
const app = require("../backend/llmChatServer");

describe("LLM Chat", () => {

  it("should create new conversation", (done) => {
    request(app)
      .post("/api/llm/new-conversation")
      .expect(201)
      .expect((res) => {
        expect(res.body.conversationId).toBeDefined();
      })
      .end(done);
  });

  it("should send message and get response", (done) => {
    request(app)
      .post("/api/llm/new-conversation")
      .end((err, res) => {
        const convId = res.body.conversationId;
        request(app)
          .post("/api/llm/chat")
          .send({ conversationId: convId, message: "Hello" })
          .expect(200)
          .expect((res) => {
            expect(res.body.botResponse).toBeDefined();
          })
          .end(done);
      });
  });

  it("should reject empty message", (done) => {
    request(app)
      .post("/api/llm/new-conversation")
      .end((err, res) => {
        const convId = res.body.conversationId;
        request(app)
          .post("/api/llm/chat")
          .send({ conversationId: convId, message: "" })
          .expect(400)
          .end(done);
      });
  });

  it("should get conversation history", (done) => {
    request(app)
      .post("/api/llm/new-conversation")
      .end((err, res) => {
        const convId = res.body.conversationId;
        request(app)
          .get(`/api/llm/conversation/${convId}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.messages).toBeDefined();
          })
          .end(done);
      });
  });

  it("should return all conversations", (done) => {
    request(app)
      .get("/api/llm/conversations")
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.conversations)).toBe(true);
      })
      .end(done);
  });

  it("should search conversations", (done) => {
    request(app)
      .post("/api/llm/search")
      .send({ searchTerm: "test" })
      .expect(200)
      .expect((res) => {
        expect(res.body.results).toBeDefined();
      })
      .end(done);
  });
});