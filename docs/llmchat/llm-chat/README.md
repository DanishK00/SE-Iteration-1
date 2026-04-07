# LLM Chat

Chat with Ollama LLM, save history, and search conversations.

## Setup

1. Install Ollama from https://ollama.ai
2. Run: `ollama serve`
3. Install model: `ollama pull llama2`
4. Install dependency: `npm install axios`

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/llm/new-conversation` | Start new chat |
| POST | `/api/llm/chat` | Send message |
| GET | `/api/llm/conversation/:id` | Get history |
| GET | `/api/llm/conversations` | List all chats |
| POST | `/api/llm/search` | Search messages |

## Files

- `backend/llmChatServer.js` - Backend
- `frontend/llmChat.html` - UI
- `frontend/llmChat.js` - Logic
- `frontend/llmChat.css` - Styling
- `tests/llmChatServer.spec.js` - Tests

## Run Tests

```bash
npm test