# Variable Input Implementation - Mobile (Updated)

This document describes the implementation of agent variable inputs in the AI Matrx mobile app with the new minimal, iOS-native design.

## Overview

The variable input system allows agents to define custom input fields that users fill out before sending messages. The interface uses clean navigation rows (iOS Settings-style) with bottom sheet editing for a native, minimal experience.

## Design Philosophy

**Before**: Bulky, always-expanded forms (150-200px per variable)
**After**: Minimal navigation rows (44-52px per variable) with progressive disclosure

### Key Features
- Clean, iOS/Android native navigation rows
- Progressive disclosure via bottom sheets
- Smart value display (text preview or count summary)
- Haptic feedback for native feel
- Space-efficient (~10 variables fit in 500px)

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

**NEW UTILITIES FOR NAVIGATION ROWS:**

**getVariableDisplayValue(variable, value)**: Smart display preview for navigation rows
- Returns formatted preview text for the row
- Handles empty states (returns helpText or "Not set")
- Checkbox: Shows count ("3 selected", "None selected") or single value
- Toggle: Shows current state
- Text types: Truncates at 40 chars, shows first line only
- Result is shown in the navigation row's value area

**shouldShowCountSummary(variable, value)**: Determines display strategy
- Returns true for checkbox (always show count)
- Returns true for long text (>50 chars or multi-line)
- Returns false for short, single-line values
- Used internally by `getVariableDisplayValue()`

### 4. UI Components (New Minimal Design)

**VariableNavigationRow** (`components/chat/VariableNavigationRow.tsx`) - NEW
- iOS Settings-style navigation row
- Layout: Label | Value Preview | ChevronRight
- Height: 44-52px (iOS/Android touch targets)
- Smart value display via `getVariableDisplayValue()`
- Haptic feedback on tap (Light)
- Required indicator (red asterisk)
- Platform-specific styling (iOS chevron-forward, Android ripple)

**VariableEditorSheet** (`components/chat/VariableEditorSheet.tsx`) - NEW
- Bottom sheet modal using `@gorhom/bottom-sheet`
- Snap points: 60%, 90%
- Backdrop blur and tap-to-dismiss
- Reuses existing `VariableInput` component for editing
- Header with variable name, help text, and close button
- Scrollable content for long forms
- Medium haptic feedback on value changes

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
- NOW USED INSIDE BOTTOM SHEET (not directly visible)

**VariableInputList** (`components/chat/VariableInputList.tsx`) - REFACTORED
- Displays variables as compact navigation rows
- Maps each variable to `VariableNavigationRow`
- Manages bottom sheet state for editing
- Optional collapsible header after first message
- Scrollable container for many variables
- Clean iOS grouped list styling

### 5. Conversation Screen (`app/(tabs)/chat/[agentId].tsx`) - UPDATED

- Displays agent-specific chat interface
- Shows variables as minimal navigation rows (always visible when agent has variables)
- Optional collapse after first message (via header toggle)
- Clean layout without bulky welcome container
- Integrates with `useAgentChat` hook for message handling

### 6. Agent Selection Screen (`app/(tabs)/chat/index.tsx`)

- Lists available agents
- Shows variable count for each agent
- Navigates to conversation screen on selection
- Pre-warms agent for faster response

## Data Flow (Updated)

1. **User selects agent** → Navigate to conversation screen
2. **Variables initialized** → From agent's `variableDefaults`, displayed as navigation rows
3. **User taps variable row** → Bottom sheet opens with full editor
4. **User edits in bottom sheet** → `VariableInput` component handles the interaction
5. **Value changes** → Medium haptic feedback, updates state in `VariableInputList`
6. **Sheet closes** → Navigation row preview updates with new value
7. **User sends message** → Variables formatted and combined with message text
8. **API request** → Includes both `user_input` (formatted display) and `variables` (raw values)

### Interaction Flow Diagram

```
User taps row → Light haptic
             ↓
  Bottom sheet opens (60%)
             ↓
  User edits value → Medium haptic on change
             ↓
  User swipes down / taps backdrop / taps close
             ↓
  Sheet closes → Light haptic
             ↓
  Row preview updates
```

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

## Component Styling (Updated)

### Navigation Rows
- **Height**: 44px (iOS) / 48px (Android) - minimum touch targets
- **Padding**: 16px horizontal (Layout.spacing.lg)
- **Border**: StyleSheet.hairlineWidth (bottom separator)
- **Background**: colors.surface, pressed state uses colors.border
- **Typography**: 16px body text, 400 weight for label
- **Layout**: Flexbox with label (left) and value+chevron (right)
- **Rounded corners**: First row (top), Last row (bottom), 12px radius

### Bottom Sheet Editor
- **Library**: `@gorhom/bottom-sheet` v5.2.8
- **Snap points**: 60% and 90% of screen height
- **Backdrop**: 50% opacity, tap to close
- **Drag handle**: Native iOS-style indicator
- **Header**: Variable name + help text + close button
- **Content**: Scrollable, reuses existing `VariableInput` components
- **Shadow**: Elevated with iOS-native shadow

### Input Components (Inside Sheet)
- Native `Switch` component for toggles
- Modal sheets for radio/checkbox selection
- Native picker appearance
- 44pt minimum touch targets
- Haptic feedback on interactions
- ≥16px font size to prevent iOS zoom
- Platform-specific styling with `Platform.select()`

### Haptic Feedback
- **Light**: Row tap, sheet dismiss (ImpactFeedbackStyle.Light)
- **Medium**: Value change in editor (ImpactFeedbackStyle.Medium)
- Follows iOS Human Interface Guidelines

## Benefits of New Design

### Space Efficiency
- **Before**: 10 variables = ~1800px vertical space
- **After**: 10 variables = ~500px vertical space
- **Improvement**: 72% reduction in space usage

### User Experience
- **Native feel**: Matches iOS Settings and Android Material patterns
- **Progressive disclosure**: See all variables at a glance, edit when needed
- **Reduced cognitive load**: Clean, scannable list instead of overwhelming form
- **Haptic feedback**: Tactile confirmation of interactions
- **Smooth animations**: Native bottom sheet with gesture support

### Developer Benefits
- **Reusable**: `VariableNavigationRow` can be used elsewhere
- **Maintainable**: Separation of concerns (display vs editing)
- **Flexible**: Easy to add new variable types
- **Accessible**: Proper accessibility labels and roles

## Testing

### Test Agents

1. **General Chat** - No variables
2. **Deep Research** - 1 textarea variable
3. **Get Ideas** - Multiple variables (textarea, radio, select)

### Test Scenarios (Updated)

- [ ] Variables display as compact navigation rows
- [ ] Tap row opens bottom sheet with correct variable
- [ ] Bottom sheet shows appropriate input component
- [ ] Value updates in sheet are reflected in row preview immediately
- [ ] Smart display works (text preview vs count for checkboxes)
- [ ] Sheet dismisses via drag, backdrop tap, and close button
- [ ] Haptics feel native (light on tap, medium on change)
- [ ] Submit with all default values
- [ ] Submit with modified variables
- [ ] Submit with variables only (no message text)
- [ ] Submit with variables + message text
- [ ] Test "Other" option with custom text
- [ ] Test checkbox multiple selections (shows "3 selected")
- [ ] Test number input with +/- buttons
- [ ] Test required field validation
- [ ] Test with 10+ variables (scroll works)
- [ ] Test all 6 component types render correctly
- [ ] Verify formatted display in chat history
- [ ] Verify API receives both user_input and variables
- [ ] Dark mode looks clean on rows and sheets
- [ ] Platform-specific touches (iOS chevron, Android ripple)

## Edge Cases Handled

1. **Empty variables**: Agent works with no variables defined
2. **Empty values**: Optional variables can be empty
3. **"Other" option**: Custom text formatted as "Other: [text]"
4. **Checkbox output**: Newline-separated string format
5. **Number constraints**: Min/max/step validation
6. **Required validation**: Shows which required fields are missing
7. **Default initialization**: Variables pre-filled with defaults

## Files Changed/Created

### New Files
1. **`components/chat/VariableNavigationRow.tsx`** - iOS Settings-style row component
2. **`components/chat/VariableEditorSheet.tsx`** - Bottom sheet modal for editing

### Modified Files
1. **`components/chat/VariableInputList.tsx`** - Refactored to use navigation rows
2. **`components/chat/index.ts`** - Added exports for new components
3. **`lib/variable-utils.ts`** - Added smart display utilities
4. **`app/(tabs)/chat/[agentId].tsx`** - Updated layout, removed bulky welcome
5. **`VARIABLE_INPUT_IMPLEMENTATION.md`** - This document (updated)

### Dependencies
- **`@gorhom/bottom-sheet`** v5.2.8 - Already installed

## Migration Notes

### Breaking Changes
- None. The new design is a drop-in replacement.
- All existing functionality preserved.
- Same API for parent components.

### Visual Changes
- Variables now show as compact rows instead of expanded forms
- Editing happens in bottom sheet instead of inline
- Welcome screen simplified (removed bulky container)

### Behavioral Changes
- Values update immediately in row preview after sheet closes
- Haptic feedback added for better UX
- Optional collapse after first message (was automatic before)

## Future Enhancements

- [ ] Variable validation error messages in sheet
- [ ] Variable presets/saved configurations
- [ ] Variable history (undo/redo)
- [ ] More component types (date picker, slider, color picker)
- [ ] Conditional variables (show based on other values)
- [ ] Variable groups/sections with headers
- [ ] Swipe actions on rows (reset, clear, duplicate)
- [ ] Search/filter for many variables

## Notes

- All variable values are stored as strings (including numbers and toggles)
- Toggle outputs string values (e.g., "Yes"/"No"), not booleans
- Checkbox outputs newline-separated string, not array
- "Other" values are prefixed with "Other: " in the variable value
- Variable names are automatically formatted from snake_case to Title Case in UI
- Variables can collapse after first message via optional header toggle
- Native keyboard/input types used for better mobile UX
- Bottom sheet uses native gesture handling (swipe to dismiss)
- Smart display logic handles truncation automatically
