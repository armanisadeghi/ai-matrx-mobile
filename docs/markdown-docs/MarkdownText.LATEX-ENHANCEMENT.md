# LaTeX Support Enhancement for MarkdownText

## Current Status
The current implementation is optimized and follows best practices, but does not include LaTeX support due to TypeScript compatibility issues with `react-native-marked` v8's Tokenizer/Renderer exports.

## Why LaTeX Support is Valuable
AI responses often include mathematical expressions:
- Equations: `$E=mc^2$`
- Summations: `$\sum_{i=1}^{n} x_i$`
- Integrals: `$\int_{0}^{\infty} f(x)dx$`
- Matrices, derivatives, and more

## Implementation Options

### Option 1: Wait for Library Update
The `react-native-marked` library documentation shows Tokenizer/Renderer should be exportable, but v8 may have TypeScript definition issues. Monitor for updates.

### Option 2: Use Custom Renderer (When Available)
```typescript
import Markdown, { Renderer, Tokenizer } from 'react-native-marked';

class LatexTokenizer extends Tokenizer {
  codespan(src: string) {
    const match = src.match(/^\$+([^\$\n]+?)\$+/);
    if (match?.[1]) {
      return {
        type: 'codespan',
        raw: match[0],
        text: match[1].trim(),
      };
    }
    return super.codespan(src);
  }
}

class LatexRenderer extends Renderer {
  codespan(text: string, styles: any) {
    // Render LaTeX here
    return <Text style={[styles, { fontStyle: 'italic' }]}>{text}</Text>;
  }
}
```

### Option 3: Integrate Full LaTeX Rendering Library
Consider these libraries for actual LaTeX rendering:
- `react-native-mathjax` - Full MathJax support
- `react-native-math-view` - Native LaTeX rendering
- `react-native-katex` - KaTeX for React Native

**Trade-offs:**
- ✅ Professional math rendering
- ❌ Adds bundle size
- ❌ May impact performance
- ❌ Additional native dependencies

### Option 4: Post-Processing Approach
Pre-process markdown to convert LaTeX to Unicode math symbols:
```typescript
function preprocessLatex(content: string): string {
  return content
    .replace(/\$([^$]+)\$/g, (_, latex) => {
      // Convert common LaTeX to Unicode
      return latex
        .replace(/\\sum/g, '∑')
        .replace(/\\int/g, '∫')
        .replace(/\\infty/g, '∞')
        .replace(/\\pi/g, 'π')
        // ... more conversions
    });
}
```

**Trade-offs:**
- ✅ No library changes needed
- ✅ Lightweight
- ❌ Limited to simple expressions
- ❌ Not true LaTeX rendering

## Recommendation

**For now:** Keep current optimized implementation without LaTeX.

**When needed:** 
1. First try Option 2 when library exports are fixed
2. If complex math is common, evaluate Option 3 libraries
3. For simple cases, Option 4 preprocessing may suffice

## Testing LaTeX Support

When implementing, test with these cases:

```markdown
# Math Examples

Inline: $E=mc^2$ and $a^2 + b^2 = c^2$

Block equation:
$$
\sum_{i=1}^{n} x_i = \frac{n(n+1)}{2}
$$

Complex:
$$
\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

## Implementation Checklist

When adding LaTeX support:
- [ ] Choose implementation approach
- [ ] Add necessary dependencies
- [ ] Implement tokenizer/renderer or preprocessing
- [ ] Test with common math expressions
- [ ] Test performance with streaming
- [ ] Document usage for other developers
- [ ] Add examples to component documentation
