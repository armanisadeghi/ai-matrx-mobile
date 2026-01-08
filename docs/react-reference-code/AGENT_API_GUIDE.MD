# Agent API Integration Guide for Mobile

## Core Architecture

**Route:** `app/(public)/p/chat/page.tsx`  
**Backend:** `{BACKEND_URL}/api/agent/*`  
**Auth:** Centralized via `useApiAuth` hook (handles both authenticated users + guests with fingerprint)

---

## 1. Prompt Source

Prompts are **hardcoded** in `features/public-chat/components/AgentSelector.tsx`:

```typescript
export const DEFAULT_AGENTS: AgentOption[] = [
    {
        id: 'general-chat',
        name: 'General Chat',
        promptId: '35d8f884-5178-4c3e-858d-c5b7adfa186a', // ← UUID to send to API
        variables: [],
    },
    {
        id: 'deep-research',
        name: 'Deep Research',
        promptId: 'f76a6b8f-b720-4730-87de-606e0bfa0e0c',
        variables: [
            { name: 'topic', type: 'string', required: false }
        ],
    },
];
```

**Mobile Implementation:**
- Store these locally or fetch from a config endpoint
- User selects agent → you get `promptId` + `variables` schema
- Pass `promptId` to `/api/agent/execute`

---

## 2. API Endpoints

### `/api/agent/warm` (Optional - Pre-cache)
**No auth required.** Call on app start or agent selection for faster first response.

```typescript
POST {BACKEND_URL}/api/agent/warm
{
  "prompt_id": "35d8f884-5178-4c3e-858d-c5b7adfa186a",
  "is_builtin": false
}
```

### `/api/agent/execute` (Main)
**Requires auth headers.** Streams NDJSON response.

```typescript
POST {BACKEND_URL}/api/agent/execute
Headers:
  - Authorization: Bearer {token} OR
  - X-Fingerprint-ID: {fingerprint_id}

Body:
{
  "prompt_id": "35d8f884-5178-4c3e-858d-c5b7adfa186a",
  "conversation_id": "{uuid}", // Client-generated, persist per conversation
  "user_input": "Hello" | [ContentItem[]],
  "variables": { "topic": "AI" }, // Optional, if agent has variables
  "config_overrides": { // Optional
    "ai_model_id": "...",
    "web_search_enabled": true,
    "thinking_enabled": true
  },
  "stream": true,
  "debug": true,
  "is_builtin": false
}
```

---

## 3. Authentication Flow

**Web uses:** `useApiAuth` hook (handles Redux-backed auth + fingerprint fallback)

**Mobile equivalent:**
1. **Authenticated user:** Send `Authorization: Bearer {jwt_token}` header
2. **Guest user:** Send `X-Fingerprint-ID: {device_fingerprint}` header

**Flow:**
- Check if user has session → use JWT token
- No session → generate/retrieve device fingerprint (FingerprintJS or equivalent)
- Backend validates either header, prioritizes token if both present

---

## 4. Content Structure (Multimodal Input)

For text-only:
```typescript
user_input: "What is AI?"
```

For multimodal (images, files, audio):
```typescript
user_input: [
  { type: "input_text", text: "What's in this image?" },
  { type: "input_image", url: "https://..." },
  { type: "input_audio", url: "https://..." },
  { type: "input_file", url: "https://..." }
]
```

**Backend-supported types:** `input_text`, `input_image`, `input_audio`, `input_file`

**Helper (web):** `buildContentArray(text, resources)` in `features/public-chat/types/content.ts`

---

## 5. Streaming Response (NDJSON)

Response is newline-delimited JSON. Parse line-by-line:

```typescript
// Event types:
{
  "event": "chunk",
  "data": "Hello" // Accumulate for message content
}

{
  "event": "status_update",
  "data": { "status": "processing", "user_visible_message": "Thinking..." }
}

{
  "event": "tool_update",
  "data": { "tool_name": "web_search", "mcp_input": {...} }
}

{
  "event": "data",
  "data": { "status": "complete", "output": "Final text", "usage": {...} }
}

{
  "event": "error",
  "data": { "message": "Error occurred", "user_visible_message": "..." }
}

{
  "event": "end",
  "data": true
}
```

**Key events:**
- `chunk`: Accumulate for streaming text display
- `status_update`: Show status indicators ("Processing...", "Searching web...")
- `tool_update`: Show tool usage (search queries, code execution, etc.)
- `error`: Display error to user
- `end`: Mark stream complete

**Ref:** `useAgentChat.ts:241-290` for NDJSON parsing implementation

---

## 6. State Management

**Web structure (for reference):**
- `ChatContext` - conversation state (messages, conversationId, currentAgent)
- `useAgentChat` - API calls + streaming logic
- `useApiAuth` - authentication headers

**Mobile equivalent:**
- Store `conversationId` (UUID, persist per chat session)
- Store `messages[]` array with `{ role, content, timestamp, status, resources? }`
- Track `isStreaming` / `isExecuting` for UI loading states
- Store `currentAgent: { promptId, name, variables }` for selected agent

---

## 7. Backend URL

**Web uses:**
```typescript
// Default
NEXT_PUBLIC_BACKEND_URL = 'https://server.app.matrxserver.com'

// Admin override (localhost testing)
http://localhost:8000
```

**Mobile:**
- Production: `https://server.app.matrxserver.com`
- You can hardcode or make it configurable for dev/staging

---

## 8. Key Differences for Mobile

| Aspect | Web | Mobile |
|--------|-----|--------|
| **Prompts** | Imported from `AgentSelector.tsx` | Store locally or fetch from config |
| **Auth** | `useApiAuth` hook (Redux) | Manual header management (JWT or fingerprint) |
| **State** | React Context + Redux | Your state management (e.g., Provider, MobX) |
| **Streaming** | `fetch` + ReadableStream | Same (use fetch) or native HTTP streaming |
| **Fingerprint** | FingerprintJS web library | FingerprintJS mobile SDK or device UUID |

---

## 9. Implementation Checklist

- [ ] Store agent list with `promptId` + `variables` schema
- [ ] Generate/persist `conversationId` per chat session
- [ ] Implement authentication headers (JWT or fingerprint)
- [ ] Build `user_input` as string or content array (for multimodal)
- [ ] Stream NDJSON response, parse line-by-line
- [ ] Accumulate `chunk` events for message display
- [ ] Handle `error` events gracefully
- [ ] Optional: Call `/api/agent/warm` on agent selection
- [ ] Optional: Support `variables` input if agent requires them
- [ ] Optional: Support `config_overrides` for advanced settings

---

## Reference Files

**Web codebase (for logic reference):**
- `features/public-chat/hooks/useAgentChat.ts` - Full API call + streaming logic
- `features/public-chat/types/agent-api.ts` - Complete API types + examples
- `features/public-chat/types/content.ts` - Multimodal content helpers
- `hooks/useApiAuth.ts` - Auth header management
- `features/public-chat/components/AgentSelector.tsx` - Agent definitions (DEFAULT_AGENTS)

**Direct questions?** The agent structure is simple: select agent → get promptId → execute with user input → stream response. Authentication is the only "magic" part (use JWT or fingerprint header).
