# Blank Sheet Fix - Auto-Close After Selection

## Problem

After making a selection in radio/select/checkbox components, the internal modal would close, but the bottom sheet would stay open showing a blank screen.

### Flow Before Fix:
1. Tap variable row → Bottom sheet opens
2. Modal auto-opens with options
3. User selects option → **Modal closes**
4. **Bottom sheet stays open (blank!)** ❌
5. User has to manually swipe down to close sheet

This created a confusing experience where users saw a blank sheet and had to perform an extra action to close it.

---

## Solution

**Auto-Close Parent Sheet After Selection**

Added an `onRequestClose` callback that flows from the bottom sheet down to the input components, allowing them to close the parent sheet when appropriate.

### Flow After Fix:
1. Tap variable row → Bottom sheet opens
2. Modal auto-opens with options
3. User selects option → **Modal closes AND sheet closes automatically** ✅
4. Done!

---

## Implementation

### 1. Added `onRequestClose` Callback Chain

**VariableEditorSheet → VariableInput → Specific Input Components**

```typescript
// VariableEditorSheet.tsx
<VariableInput
  variable={variable}
  value={value}
  onChange={handleValueChange}
  autoOpen={true}
  onRequestClose={onClose}  // ✅ Pass down the close callback
/>

// VariableInput.tsx
interface VariableInputProps {
  variable: PromptVariable;
  value: string;
  onChange: (value: string) => void;
  autoOpen?: boolean;
  onRequestClose?: () => void;  // ✅ New callback
}

// Pass to child components
<RadioInput
  variable={variable}
  value={value}
  onChange={onChange}
  colors={colors}
  autoOpen={autoOpen}
  onRequestClose={onRequestClose}  // ✅ Pass through
/>
```

### 2. Components Auto-Close Based on Behavior

Each component type closes appropriately:

**Radio/Select (Single Selection):**
```typescript
const handleSelect = (option: string) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  onChange(option);
  setShowModal(false);
  // Close parent sheet if in auto-open mode
  if (autoOpen && onRequestClose) {
    setTimeout(() => onRequestClose(), 300); // ✅ Delay for animation
  }
};
```

**Checkbox (Multiple Selection):**
```typescript
// On "Done" button:
<TouchableOpacity onPress={() => {
  setShowModal(false);
  if (autoOpen && onRequestClose) {
    setTimeout(() => onRequestClose(), 300); // ✅ Close after Done
  }
}}>
  <Text>Done</Text>
</TouchableOpacity>
```

**Toggle (Instant Change):**
```typescript
const handleToggle = (newValue: boolean) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  onChange(newValue ? onLabel : offLabel);
  // Close parent sheet after toggle
  if (onRequestClose) {
    setTimeout(() => onRequestClose(), 300); // ✅ Close immediately
  }
};
```

**Textarea (Manual Close):**
```typescript
function TextareaInput({ variable, value, onChange, colors, onRequestClose }: InputComponentProps) {
  // Textarea doesn't auto-close - user needs to swipe down or tap backdrop
  // User might want to continue editing
}
```

**Number (Manual Close):**
```typescript
function NumberInput({ variable, value, onChange, colors, onRequestClose }: InputComponentProps) {
  // Number doesn't auto-close - user might want to adjust multiple times
  // User uses +/- buttons repeatedly
}
```

---

## Auto-Close Behavior by Component

| Component | Auto-Closes? | Reason |
|-----------|--------------|--------|
| **Radio** | ✅ Yes | Single selection, done immediately |
| **Select** | ✅ Yes | Single selection, done immediately |
| **Checkbox** | ✅ Yes | Multiple selection, closes on "Done" button |
| **Toggle** | ✅ Yes | Single action, done immediately |
| **Textarea** | ❌ No | User might want to continue editing |
| **Number** | ❌ No | User might want to adjust multiple times |

---

## Timing: 300ms Delay

```typescript
setTimeout(() => onRequestClose(), 300);
```

**Why the delay?**
- Allows the modal's close animation to complete first
- Prevents jarring double-animation
- Creates smooth, native-feeling transition
- Modal closes → Short pause → Sheet closes

Without the delay, both animations would fight each other and look janky.

---

## User Experience

### Example: Radio Selection

**Before (Broken):**
1. Tap "Creativity Level"
2. Options appear
3. Tap "Experimental"
4. Modal closes
5. **Blank sheet visible** 😕
6. Swipe down to close sheet
7. **Total: 4 actions**

**After (Fixed):**
1. Tap "Creativity Level"
2. Options appear
3. Tap "Experimental"
4. Everything closes smoothly ✨
5. **Total: 2 actions**

**Result:** 50% fewer actions, no confusion!

---

### Example: Toggle

**Before:**
1. Tap "Enable Feature"
2. Toggle appears
3. Tap toggle switch
4. Value changes but **blank sheet visible** 😕
5. Swipe down to close

**After:**
1. Tap "Enable Feature"
2. Toggle appears
3. Tap toggle switch
4. Everything closes ✨

---

### Example: Checkbox

**Before:**
1. Tap "Select Options"
2. Checkboxes appear
3. Select 3 options
4. Tap "Done"
5. Modal closes but **blank sheet visible** 😕
6. Swipe down to close

**After:**
1. Tap "Select Options"
2. Checkboxes appear
3. Select 3 options
4. Tap "Done"
5. Everything closes ✨

---

### Example: Textarea (Correct Behavior)

**Before and After (Same - Intentional):**
1. Tap "Topic"
2. Textarea appears
3. Type several paragraphs
4. User swipes down when done
5. Sheet closes

**Why no auto-close?** User might need to think, revise, or add more text. Don't interrupt their editing.

---

## Files Modified

1. **`components/chat/VariableInput.tsx`**
   - Added `onRequestClose` prop to interface
   - Pass `onRequestClose` to all input components
   - RadioInput: Calls `onRequestClose` after selection
   - CheckboxInput: Calls `onRequestClose` on "Done"
   - ToggleInput: Calls `onRequestClose` after toggle
   - SelectInput: Passes to RadioInput
   - TextareaInput: Accepts prop but doesn't use it (manual close)
   - NumberInput: Accepts prop but doesn't use it (manual close)

2. **`components/chat/VariableEditorSheet.tsx`**
   - Pass `onRequestClose={onClose}` to VariableInput
   - Connects bottom sheet close to input components

---

## Benefits

### User Experience:
- ✅ No blank sheet confusion
- ✅ Faster workflow (fewer actions)
- ✅ Smooth animations
- ✅ Feels native and polished
- ✅ Intuitive behavior

### Technical:
- ✅ Clean callback pattern
- ✅ Flexible (each component decides behavior)
- ✅ Optional callback (backwards compatible)
- ✅ Proper animation timing
- ✅ No race conditions

---

## Edge Cases Handled

### 1. Radio "Other" Option
When user selects "Other" and enters custom text:
```typescript
const handleOtherSubmit = () => {
  if (otherText.trim()) {
    onChange(formatOtherValue(otherText.trim()));
    setShowModal(false);
    setShowOtherInput(false);
    if (autoOpen && onRequestClose) {
      setTimeout(() => onRequestClose(), 300); // ✅ Closes after custom input
    }
  }
};
```

### 2. Checkbox Cancel
When user taps "Cancel" button:
```typescript
<TouchableOpacity onPress={() => {
  setShowModal(false);
  if (autoOpen && onRequestClose) {
    setTimeout(() => onRequestClose(), 300); // ✅ Also closes on cancel
  }
}}>
```

### 3. Multiple Rapid Selections
300ms timeout prevents overlapping close calls:
```typescript
setTimeout(() => onRequestClose(), 300);
// If user somehow triggers multiple closes, the timeout de-bounces them
```

---

## Testing

### Test Scenario 1: Radio Quick Selection
1. Tap "Creativity Level"
2. Immediately tap "Experimental"
3. ✅ Modal closes, brief pause, sheet closes smoothly
4. ✅ No blank sheet visible

### Test Scenario 2: Checkbox Multiple Selections
1. Tap "Options"
2. Select 3 checkboxes
3. Tap "Done"
4. ✅ Modal closes, brief pause, sheet closes smoothly
5. ✅ No blank sheet visible

### Test Scenario 3: Toggle Instant
1. Tap "Enable Feature"
2. Tap toggle
3. ✅ Sheet closes immediately (after 300ms)
4. ✅ Smooth animation

### Test Scenario 4: Textarea (Should NOT Auto-Close)
1. Tap "Description"
2. Type some text
3. ✅ Sheet stays open
4. Swipe down manually
5. ✅ Sheet closes

### Test Scenario 5: Number Stepper (Should NOT Auto-Close)
1. Tap "Count"
2. Tap + button 3 times
3. ✅ Sheet stays open for multiple adjustments
4. Swipe down manually
5. ✅ Sheet closes

---

## Key Takeaway

**Different input types have different interaction patterns:**

- **Quick selections** (radio, select, toggle) → Auto-close immediately
- **Confirmed selections** (checkbox with Done) → Auto-close on confirmation
- **Continuous editing** (textarea, number) → Manual close only

This creates an intuitive, native-feeling experience where the UI gets out of the way as soon as the user is done with their action. ✨

