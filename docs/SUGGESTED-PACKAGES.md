## High-Impact Libraries for Your LLM Chat App

Based on my research, here are the gems that will make a significant difference, especially for a ChatGPT-style interface:

### Core Chat Infrastructure

| Library | Purpose | Why It's Great |
|---------|---------|----------------|
| **`react-native-keyboard-controller`** | Keyboard handling | Purpose-built for chat apps. `translate-with-padding` mode is specifically optimized for chat UIs. Native thread animations, no jank when keyboard appears/dismisses. |
| **`@shopify/flash-list`** | Message list | You already found this one—10x faster than FlatList for large lists. Essential for chat. |
| **`react-native-reanimated`** | Animations | UI thread animations. Use for typing indicators, message send animations, swipe-to-reply. |
| **`react-native-gesture-handler`** | Gestures | Swipe-to-reply, long-press for context menu, pan to dismiss. Works seamlessly with Reanimated. |

### LLM Streaming & Markdown Rendering

| Library | Purpose | Why It's Great |
|---------|---------|----------------|
| **`react-native-marked`** | Markdown rendering | Uses FlatList internally for performance. Supports custom renderers for code blocks, links. Better streaming performance than `react-native-markdown-display`. |
| **`react-native-code-highlighter`** | Code blocks | Syntax highlighting for 180+ languages. Works with `react-syntax-highlighter` styles. |
| **`expo/fetch`** | Streaming API calls | SDK 54 includes WinterCG-compliant fetch with download streaming—built for AI APIs. |

### Native Feel Enhancements

| Library | Purpose | Why It's Great |
|---------|---------|----------------|
| **`expo-haptics`** | Tactile feedback | Message sent confirmation, button presses, error states. |
| **`expo-clipboard`** | Copy code/messages | Native clipboard access for "copy message" functionality. |
| **`lottie-react-native`** | Animated indicators | Thinking/loading animations. Much smoother than animated dots built from scratch. |
| **`expo-blur`** | iOS blur effects | Native blur for modals, context menus. Feels like a first-party iOS app. |

### Chat-Specific Recommendations

**For streaming text (the "typing" effect):**
```typescript
// Don't render character-by-character with setState
// Instead, accumulate tokens and render in batches
// Use react-native-marked with memoization

const MemoizedMarkdown = React.memo(({ content }: { content: string }) => (
  <Markdown value={content} />
), (prev, next) => prev.content === next.content);
```

**For the message input:**
```typescript
// Use KeyboardController's KeyboardStickyView for the input bar
// It sticks to the keyboard with native animations
import { KeyboardStickyView } from 'react-native-keyboard-controller';

<KeyboardStickyView offset={{ closed: 0, opened: bottomInset }}>
  <MessageInput />
</KeyboardStickyView>
```

**For inverted message list (newest at bottom):**
```typescript
// FlashList supports inverted lists natively
<FlashList
  data={messages}
  inverted
  estimatedItemSize={100} // Important for performance
  renderItem={renderMessage}
/>
```

### Additional High-Impact Picks

| Library | Purpose | Impact |
|---------|---------|--------|
| **`react-native-mmkv`** | Fast local storage | 30x faster than AsyncStorage. Use for caching conversations, user preferences. |
| **`expo-secure-store`** | Auth tokens | Already in your stack—encrypts sensitive data on device. |
| **`react-native-context-menu-view`** | Long-press menus | Native iOS/Android context menus for "Copy", "Reply", "Delete" on messages. |
| **`@gorhom/bottom-sheet`** | Bottom sheets | Native-feeling bottom sheets for settings, model selection, conversation options. |
| **`expo-image`** | Image messages | Blur-up loading, caching, multiple formats. Much better than RN's Image. |

### Installation Command

```bash
# Core chat infrastructure
npx expo install react-native-keyboard-controller @shopify/flash-list react-native-reanimated react-native-gesture-handler

# Markdown & code
npx expo install react-native-marked react-native-code-highlighter react-syntax-highlighter

# Native feel
npx expo install expo-haptics expo-clipboard expo-blur lottie-react-native

# Storage & utilities  
npx expo install react-native-mmkv react-native-context-menu-view @gorhom/bottom-sheet expo-image
```

### Quick Wins for Chat UX

1. **Haptic on send**: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` when user sends a message
2. **Scroll-to-bottom button**: Appears when user scrolls up, fades with Reanimated
3. **Typing indicator**: Use Lottie animation, not custom animated dots
4. **Code block copy button**: One tap to copy entire code block with `expo-clipboard`
5. **Message timestamps**: Show on long-press or swipe, not cluttering the UI
6. **Pull-to-load-more**: Native refresh control for loading older messages

These libraries are battle-tested and used in production by companies like Shopify, Airbnb, and Discord. They'll give your chat app that "this feels right" quality that users expect from native iOS apps.