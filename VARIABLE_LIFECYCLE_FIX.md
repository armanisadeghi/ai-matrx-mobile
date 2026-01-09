# Variable Lifecycle Fix

## Problem
Variables were showing throughout the conversation and had collapsible UI, but they should only be visible for the first message of a new conversation.

## Solution
Variables are now **only visible before the first message** and completely disappear after the first message is sent. This matches the intended behavior where variables are used to configure the initial context for an agent conversation.

## Changes Made

### 1. VariableInputList.tsx
**Removed:**
- Collapsible header UI (toggle button, chevron icons)
- `isExpanded` and `onToggleExpanded` props
- `handleToggle` function

**Added:**
- Early return if `hasMessages` is true (variables only show when no messages exist)
- Variables are always expanded when visible (no collapse state needed)

**Key Logic:**
```typescript
// Don't show variables if there are messages (variables are only for first message)
if (hasMessages) {
  return null;
}
```

### 2. [agentId].tsx
**Removed:**
- `isVariablesExpanded` state
- `handleToggleVariables` function
- `useEffect` that collapsed variables after first message

**Added:**
- `hasVariableValues` check to determine if any variable has a value
- Conditional rendering: `{hasVariables && !hasMessages && (...)}`

**Key Logic:**
```typescript
// Check if any variable has a value
const hasVariableValues = Object.keys(variableValues).some(
  key => variableValues[key] && variableValues[key].trim() !== ''
);

// Only show variables before first message
{hasVariables && !hasMessages && (
  <VariableInputList ... />
)}
```

### 3. ChatInput.tsx
**Added:**
- `hasVariableValues` prop to allow sending without text when variables have values
- Updated `canSend` logic: `(message.trim().length > 0 || hasVariableValues) && !isSending`
- Updated `handleSend` to allow empty messages if variables have values

**Key Logic:**
```typescript
// Allow sending if: (message has content) OR (has variable values)
if ((!message.trim() && !hasVariableValues) || isSending) return;

// Can send if: (has message text) OR (has variable values)
const canSend = (message.trim().length > 0 || hasVariableValues) && !isSending;
```

**Placeholder Update:**
```typescript
const placeholderText = hasVariables && !hasMessages
  ? 'Optional: Add additional context or instructions'
  : 'Ask Matrx';
```

## Behavior

### Before First Message (Welcome Screen)
- ✅ Variables are fully visible and editable
- ✅ User can edit variables via bottom sheet
- ✅ User can send with just variables (no text required)
- ✅ User can send with variables + text
- ✅ Send button is enabled if any variable has a value

### After First Message
- ✅ Variables completely disappear
- ✅ No toggle/collapse UI
- ✅ Variables are not accessible for subsequent messages
- ✅ Standard chat input behavior (text required to send)

## User Experience
1. User selects an agent with variables
2. Variables display prominently on welcome screen
3. User fills in variable values (or uses defaults)
4. User optionally adds additional context in text input
5. User sends first message (can send with just variables, no text required)
6. **Variables instantly disappear after first message**
7. Conversation continues as normal chat (no variables)

## Technical Notes
- Variables are stored in state throughout the conversation but are only used for the first message
- The `hasMessages` check ensures variables are hidden after any message is sent
- The `hasVariableValues` check enables the send button when variables have values, even without text input
- This matches the web version's behavior where variables are primarily for initial context

