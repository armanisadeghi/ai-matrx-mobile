# Variable Input Implementation - Mobile

This document describes the implementation of agent variable inputs in the AI Matrx mobile app.

## Overview

The variable input system allows agents to define custom input fields that users fill out before sending messages. This provides a structured way to collect information specific to each agent's functionality.

## Architecture

### 1. Type Definitions (`types/agent.ts`)

**PromptVariable**: Defines a single variable input
- `name`: Variable identifier (e.g., "topic", "creativity_level")
- `defaultValue`: Default value as string
- `required`: Whether the variable is required
- `helpText`: Placeholder/hint text
- `customComponent`: Configuration for the input component type

**VariableCustomComponent**: Configuration for custom input types
- `type`: Component type (textarea, toggle, radio, checkbox, select, number)
- `options`: Array of options for select/radio/checkbox
- `allowOther`: Whether to include "Other" option with custom text input
- `toggleValues`: Labels for toggle [offLabel, onLabel]
- `min/max/step`: Constraints for number inputs

### 2. Agent Configuration (`constants/agents.ts`)

Agents define their variables in the `variableDefaults` array:

```typescript
{
  id: 'get-ideas',
  name: 'Get Ideas',
  variableDefaults: [
    {
      name: 'topic',
      defaultValue: 'Building a powerful ai app for attorneys',
      required: true,
      helpText: 'What topic or concept do you want ideas for?',
      customComponent: { type: 'textarea' }
    },
    {
      name: 'creativity_level',
      defaultValue: 'Balanced - Mix of practical and innovative',
      customComponent: {
        type: 'radio',
        options: [
          'Grounded - Practical and immediately actionable',
          'Balanced - Mix of practical and innovative',
          'Experimental - Push boundaries and explore wild ideas',
          'Visionary - Think big, ignore current constraints'
        ]
      }
    }
  ]
}
```

### 3. Utility Functions (`lib/variable-utils.ts`)

**formatVariableName**: Converts snake_case to Title Case
**initializeVariableValues**: Creates initial values object from defaults
**formatVariablesForDisplay**: Formats variables for chat history display
**buildUserInputWithVariables**: Combines formatted variables with user message
**validateRequiredVariables**: Checks required fields
**adjustNumberValue**: Handles number input increment/decrement

### 4. UI Components

**VariableInput** (`components/chat/VariableInput.tsx`)
- Renders appropriate input based on variable type
- Handles all 6 component types:
  - **Textarea**: Multi-line text input (default)
  - **Toggle**: Native switch component
  - **Radio**: Single selection with modal picker
  - **Checkbox**: Multiple selection with modal picker
  - **Select**: Dropdown single selection (uses Radio component)
  - **Number**: Number input with +/- stepper buttons
- Supports "Other" option for radio/checkbox/select
- Native iOS/Android styling and interactions

**VariableInputList** (`components/chat/VariableInputList.tsx`)
- Manages all variable inputs for an agent
- Shows variable labels with required indicators
- Collapsible after first message
- Scrollable if many variables

### 5. Conversation Screen (`app/(tabs)/chat/[agentId].tsx`)

- Displays agent-specific chat interface
- Shows variable inputs prominently before first message
- Collapses variables after sending first message
- Integrates with `useAgentChat` hook for message handling

### 6. Agent Selection Screen (`app/(tabs)/chat/index.tsx`)

- Lists available agents
- Shows variable count for each agent
- Navigates to conversation screen on selection
- Pre-warms agent for faster response

## Data Flow

1. **User selects agent** → Navigate to conversation screen
2. **Variables initialized** → From agent's `variableDefaults`
3. **User fills variables** → State updates in `VariableInputList`
4. **User sends message** → Variables formatted and combined with message text
5. **API request** → Includes both `user_input` (formatted display) and `variables` (raw values)

### API Request Format

```typescript
{
  prompt_id: "agent-prompt-uuid",
  conversation_id: "conversation-uuid",
  user_input: "Topic: AI for healthcare\nCreativity Level: Balanced\n\nFocus on diagnosis",
  variables: {
    topic: "AI for healthcare",
    creativity_level: "Balanced - Mix of practical and innovative"
  },
  stream: true
}
```

The `user_input` field contains the formatted display string (what appears in chat history).
The `variables` field contains the raw key-value pairs (what the agent uses).

## Component Styling

All components follow iOS native patterns:
- Native `Switch` component for toggles
- Modal sheets for radio/checkbox selection
- Native picker appearance
- 44pt minimum touch targets
- Haptic feedback on interactions
- ≥16px font size to prevent iOS zoom
- Platform-specific styling with `Platform.select()`

## Testing

### Test Agents

1. **General Chat** - No variables
2. **Deep Research** - 1 textarea variable
3. **Get Ideas** - Multiple variables (textarea, radio, select)

### Test Scenarios

- [ ] Submit with all default values
- [ ] Submit with modified variables
- [ ] Submit with variables only (no message text)
- [ ] Submit with variables + message text
- [ ] Test "Other" option with custom text
- [ ] Test checkbox multiple selections
- [ ] Test number input with +/- buttons
- [ ] Test required field validation
- [ ] Test variable collapse/expand
- [ ] Test all component types render correctly
- [ ] Verify formatted display in chat history
- [ ] Verify API receives both user_input and variables

## Edge Cases Handled

1. **Empty variables**: Agent works with no variables defined
2. **Empty values**: Optional variables can be empty
3. **"Other" option**: Custom text formatted as "Other: [text]"
4. **Checkbox output**: Newline-separated string format
5. **Number constraints**: Min/max/step validation
6. **Required validation**: Shows which required fields are missing
7. **Default initialization**: Variables pre-filled with defaults

## Future Enhancements

- [ ] Variable validation error messages
- [ ] Variable presets/saved configurations
- [ ] Variable history
- [ ] More component types (date picker, slider, etc.)
- [ ] Conditional variables (show based on other values)
- [ ] Variable groups/sections

## Notes

- All variable values are stored as strings (including numbers and toggles)
- Toggle outputs string values (e.g., "Yes"/"No"), not booleans
- Checkbox outputs newline-separated string, not array
- "Other" values are prefixed with "Other: " in the variable value
- Variable names are automatically formatted from snake_case to Title Case in UI
- Variables collapse after first message to focus on conversation
- Native keyboard/input types used for better mobile UX
