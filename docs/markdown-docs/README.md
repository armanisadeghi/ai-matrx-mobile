# Chat Components

This directory contains all chat-related UI components for AI Matrx Mobile.

## Components

### MarkdownText
**File:** `MarkdownText.tsx`

Optimized markdown rendering component for AI chat responses using `react-native-marked`.

**Key Features:**
- ✅ Type-safe implementation (no `as any` assertions)
- ✅ Performance optimized with memoization for streaming
- ✅ Follows library best practices
- ✅ Supports all standard markdown elements
- ✅ Theme-aware (dark/light mode)
- ✅ Properly styled code blocks and inline code

**Usage:**
```typescript
import { MarkdownText } from '@/components/chat';

<MarkdownText 
  content="# Hello\n\nThis is **markdown** content" 
  isUser={false} 
/>
```

**Props:**
- `content` (string, required): The markdown content to render
- `isUser` (boolean, optional): Whether this is a user message (affects text color)

**Performance:**
- Memoized to prevent unnecessary re-renders during streaming
- Optimized for rapid content updates
- Minimal memory allocations

**Documentation:**
- See `MarkdownText.IMPROVEMENTS.md` for detailed changes and best practices
- See `MarkdownText.LATEX-ENHANCEMENT.md` for future LaTeX support options

---

### Other Components

- **ChatBubble**: Message bubble container with native iOS styling
- **ChatInput**: Multi-line input with attachment and voice recording
- **MessageList**: Optimized FlashList for message rendering
- **MessageActions**: Copy, regenerate, and other message actions
- **TypingIndicator**: Lottie-based typing animation
- **ChatHeader**: Navigation header with conversation title
- **AgentBottomSheet**: Agent selection bottom sheet
- **ModeBottomSheet**: Mode selection bottom sheet

## Library Usage

### react-native-marked

**Version:** `^8.0.0`

**Best Practices Implemented:**
1. ✅ Memoized styles to prevent re-creation
2. ✅ Type-safe style definitions with const assertions
3. ✅ Performance-optimized FlatList props (`initialNumToRender: 8`)
4. ✅ Proper React.memo with custom comparison
5. ✅ No unnecessary style overrides

**What We Don't Use (And Why):**
- `theme` prop: TypeScript definitions incomplete in v8, using `styles` works well
- Custom Tokenizer/Renderer: Export issues in v8, planned for future
- LaTeX support: Waiting for library updates (see LATEX-ENHANCEMENT.md)

**Resources:**
- [react-native-marked GitHub](https://github.com/gmsgowtham/react-native-marked)
- [Official Documentation](https://github.com/gmsgowtham/react-native-marked#readme)

## Development Guidelines

### Adding New Chat Components

1. **Performance First**: Use `React.memo` for all components
2. **Type Safety**: No `as any` - use proper TypeScript types
3. **Platform Native**: Follow iOS/Android native patterns
4. **Accessibility**: Add proper labels and roles
5. **Haptics**: Use `expo-haptics` for interactions

### Testing Chat Components

1. Test with long messages (1000+ words)
2. Test streaming updates (rapid changes)
3. Test with various markdown formatting
4. Test dark/light mode switching
5. Monitor memory usage during extended sessions

### Code Quality

- Keep components under 200 lines
- Co-locate styles with components
- Use design tokens from `/constants`
- Document complex logic with comments
- Add JSDoc for exported components

## Future Enhancements

### Planned
- [ ] LaTeX support for math equations (when library exports are fixed)
- [ ] Syntax highlighting for code blocks
- [ ] Image rendering in markdown
- [ ] Table support
- [ ] Collapsible long messages

### Under Consideration
- [ ] Full MathJax integration for complex equations
- [ ] Mermaid diagram support
- [ ] Custom emoji rendering
- [ ] Message reactions
- [ ] Thread support

## Performance Metrics

### Target Metrics
- First render: < 16ms (60 FPS)
- Streaming update: < 8ms (120 FPS)
- Memory per message: < 1KB
- Scroll performance: 60 FPS sustained

### Monitoring
Use React DevTools Profiler and React Native Performance Monitor to track:
- Render count
- Render duration
- Memory usage
- Frame drops

## Troubleshooting

### Common Issues

**Issue:** Markdown not rendering correctly
- Check content format (valid markdown syntax)
- Verify `content` prop is a string
- Check console for warnings

**Issue:** Performance degradation with long messages
- Verify memoization is working (check React DevTools)
- Check if styles are being recreated (add logging)
- Consider message length limits or pagination

**Issue:** Dark mode colors not updating
- Verify `useColorScheme` hook is working
- Check if memoization dependencies include colors
- Force re-render by toggling theme

## Related Documentation

- `/docs/CHAT-SETUP-COMPLETE.md` - Chat feature implementation guide
- `/docs/SUGGESTED-PACKAGES.md` - Recommended packages for chat features
- `/constants/colors.ts` - Color system documentation
- `/constants/typography.ts` - Typography system documentation
