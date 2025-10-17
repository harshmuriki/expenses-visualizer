# Theme System Guide

This application features a comprehensive, dynamic theme system with 9 beautiful pre-built themes and advanced customization capabilities.

## 🎨 Available Themes

### 1. **Dark** 🌙
Classic dark theme with blue-grey accents. Perfect for extended use and low-light environments.

**Key Colors:**
- Primary: `#80A1BA` (Blue-grey)
- Secondary: `#91C4C3` (Teal)
- Accent: `#B4DEBD` (Mint green)

### 2. **Light** ☀️
Clean light theme with bright, vibrant colors. Great for daytime use and high-visibility needs.

**Key Colors:**
- Primary: `#0ea5e9` (Sky blue)
- Secondary: `#22c55e` (Green)
- Accent: `#ec4899` (Pink)

### 3. **Ocean** 🌊
Ocean-inspired theme with cyan and teal tones. Calm and refreshing aesthetic.

**Key Colors:**
- Primary: `#0ea5e9` (Sky)
- Secondary: `#06b6d4` (Cyan)
- Accent: `#14b8a6` (Teal)

### 4. **Sunset** 🌅
Warm oranges, pinks, and purples. Energetic and vibrant, perfect for creative work.

**Key Colors:**
- Primary: `#f97316` (Orange)
- Secondary: `#d946ef` (Fuchsia)
- Accent: `#ec4899` (Pink)

### 5. **Midnight** 🌌
Deep blues and purples for night owls. The darkest theme with rich, saturated colors.

**Key Colors:**
- Primary: `#3b82f6` (Blue)
- Secondary: `#8b5cf6` (Violet)
- Accent: `#a855f7` (Purple)

### 6. **Forest** 🌲
Natural greens and earthy tones. Calming and grounded aesthetic.

**Key Colors:**
- Primary: `#22c55e` (Green)
- Secondary: `#84cc16` (Lime)
- Accent: `#14b8a6` (Teal)

### 7. **Purple Haze** 💜
Rich purples, magentas, and violets. Bold and distinctive appearance.

**Key Colors:**
- Primary: `#a855f7` (Purple)
- Secondary: `#d946ef` (Fuchsia)
- Accent: `#ec4899` (Pink)

### 8. **Cherry Blossom** 🌸
Soft pinks and elegant whites. Light, delicate, and sophisticated.

**Key Colors:**
- Primary: `#ec4899` (Pink)
- Secondary: `#f43f5e` (Rose)
- Accent: `#ef4444` (Red)

### 9. **Nordic** ❄️
Cool blues and minimalist grays. Clean, modern Scandinavian design.

**Key Colors:**
- Primary: `#0ea5e9` (Sky)
- Secondary: `#64748b` (Slate)
- Accent: `#3b82f6` (Blue)

---

## ⚙️ Using the Theme Switcher

### Basic Usage

The `ThemeSwitcher` component can be added anywhere in your application:

```tsx
import ThemeSwitcher from '@/components/ThemeSwitcher';

function MyComponent() {
  return <ThemeSwitcher />;
}
```

### Component Props

```typescript
interface ThemeSwitcherProps {
  className?: string;              // Custom CSS classes
  showLabel?: boolean;             // Show "Theme" label (default: true)
  size?: "sm" | "md" | "lg";      // Component size (default: "md")
  showColorPreviews?: boolean;     // Show color swatches (default: true)
  enableKeyboardShortcuts?: boolean; // Enable shortcuts (default: true)
}
```

### Examples

```tsx
// Compact version without label
<ThemeSwitcher showLabel={false} size="sm" />

// Without color previews
<ThemeSwitcher showColorPreviews={false} />

// Disable keyboard shortcuts
<ThemeSwitcher enableKeyboardShortcuts={false} />
```

---

## ⌨️ Keyboard Shortcuts

### Quick Theme Cycling
**Shortcut:** `Cmd/Ctrl + Shift + T`

Quickly cycle through all available themes without opening the dropdown.

---

## 🌓 System Theme Detection

The theme system can automatically adapt to your operating system's color scheme preference.

### How to Enable

1. Open the Theme Switcher dropdown
2. Toggle the "Auto (System)" switch at the bottom
3. The theme will automatically switch between Light and Dark based on your system

### How It Works

- When enabled, the app detects your system's `prefers-color-scheme` setting
- Automatically switches between Light theme (day) and Dark theme (night)
- Updates in real-time when you change your system preferences
- Preference is saved in localStorage

---

## 🎯 Using Themes in Your Code

### Accessing Theme Context

```tsx
import { useTheme } from '@/lib/theme-context';

function MyComponent() {
  const {
    theme,           // Current theme object
    themeName,       // Current theme name
    setTheme,        // Function to change theme
    availableThemes, // Array of all theme names
    systemTheme,     // System preference ('light' | 'dark')
    useSystemTheme,  // Whether auto-detection is enabled
    setUseSystemTheme // Function to toggle auto-detection
  } = useTheme();

  return (
    <div style={{ backgroundColor: theme.background.primary }}>
      Current theme: {themeName}
    </div>
  );
}
```

### Accessing Theme Colors

```tsx
import { useTheme } from '@/lib/theme-context';

function MyComponent() {
  const { theme } = useTheme();

  return (
    <div style={{
      backgroundColor: theme.background.primary,
      color: theme.text.primary,
      borderColor: theme.border.primary,
    }}>
      {/* Your content */}
    </div>
  );
}
```

### Using Tailwind CSS Classes

All theme colors are available as CSS custom properties:

```tsx
<div className="bg-background-primary text-text-primary border-border-primary">
  Themed content
</div>
```

---

## 🎨 Color Palette Structure

Each theme includes:

### Primary Colors
- 10 shades from 50 (lightest) to 900 (darkest)
- Used for main interactive elements

### Secondary Colors
- 10 shades from 50 to 900
- Used for complementary UI elements

### Accent Colors
- 10 shades from 50 to 900
- Used for highlights and call-to-action elements

### Neutral Colors
- 11 shades from 50 to 950
- Used for text, borders, and backgrounds

### Semantic Colors
- Success: `#10b981` (green)
- Warning: `#f59e0b` (orange)
- Error: `#ef4444` (red)
- Info: Theme-specific blue

### Background Colors
- `primary`: Main background
- `secondary`: Card backgrounds
- `tertiary`: Elevated elements
- `glass`: Translucent overlays
- `card`: Card containers

### Text Colors
- `primary`: Main text
- `secondary`: Subtle text
- `tertiary`: Muted text
- `inverse`: Contrast text

### Border Colors
- `primary`: Main borders
- `secondary`: Subtle borders
- `focus`: Focus indicators
- `glass`: Translucent borders

### Category Colors
- 12 distinct colors for data visualization
- Optimized for charts, graphs, and TreeMaps

---

## 🔧 Creating Custom Themes

### Step 1: Define Your Theme

Add a new theme to `lib/colors.ts`:

```typescript
export const myCustomTheme: ColorTheme = {
  primary: {
    50: "#...",
    // ... all shades
    900: "#...",
  },
  secondary: { /* ... */ },
  accent: { /* ... */ },
  neutral: { /* ... */ },
  semantic: {
    success: "#...",
    warning: "#...",
    error: "#...",
    info: "#...",
  },
  background: {
    primary: "#...",
    secondary: "#...",
    tertiary: "#...",
    glass: "rgba(...)",
    card: "rgba(...)",
  },
  text: {
    primary: "#...",
    secondary: "#...",
    tertiary: "#...",
    inverse: "#...",
  },
  border: {
    primary: "#...",
    secondary: "#...",
    focus: "#...",
    glass: "rgba(...)",
  },
  gradients: {
    primary: "from-... to-...",
    secondary: "from-... to-...",
    accent: "from-... to-...",
    background: "from-... via-... to-...",
  },
  categories: [
    "#...", "#...", // 12 colors
  ],
};
```

### Step 2: Register Your Theme

Add it to the themes object:

```typescript
export const themes = {
  dark: darkTheme,
  light: lightTheme,
  ocean: oceanTheme,
  // ... other themes
  myCustom: myCustomTheme, // Add your theme
} as const;
```

### Step 3: Add Labels and Descriptions

Update `ThemeSwitcher.tsx`:

```typescript
const themeLabels: Record<ThemeName, string> = {
  // ... existing themes
  myCustom: "🎨 My Custom",
};

const themeDescriptions: Record<ThemeName, string> = {
  // ... existing themes
  myCustom: "Description of my custom theme",
};
```

---

## 🌈 Theme Transitions

Themes transition smoothly when changed thanks to CSS transitions.

### Transition Properties

The following properties animate during theme changes:
- `background-color`
- `border-color`
- `color`
- `fill`
- `stroke`

### Duration
- **300ms** ease-in-out transition

### Disabling Transitions

To prevent transitions (e.g., on initial page load):

```tsx
<div className="no-transitions">
  {/* Content without transitions */}
</div>
```

---

## 💾 Theme Persistence

### LocalStorage Keys

- `theme`: Currently selected theme name
- `useSystemTheme`: Whether auto-detection is enabled

### Behavior

1. **Manual Selection**: Theme persists across sessions
2. **System Detection**: Preference persists, theme updates with system
3. **Priority**: System detection overrides manual selection when enabled

---

## 🎯 Best Practices

### 1. Use Semantic Colors

```tsx
// ✅ Good - semantic and theme-aware
<button className="bg-primary-500 text-text-inverse">
  Submit
</button>

// ❌ Bad - hardcoded colors
<button className="bg-blue-500 text-white">
  Submit
</button>
```

### 2. Leverage Theme Context

```tsx
// ✅ Good - reactive to theme changes
const { theme } = useTheme();
<div style={{ color: theme.text.primary }}>

// ❌ Bad - not theme-aware
<div style={{ color: '#ffffff' }}>
```

### 3. Use Category Colors for Charts

```tsx
import { useTheme } from '@/lib/theme-context';

function MyChart() {
  const { theme } = useTheme();

  const chartConfig = {
    colors: theme.categories, // Auto-adapts to theme
  };
}
```

### 4. Test All Themes

When creating components, test them with multiple themes to ensure readability and contrast.

---

## 🐛 Troubleshooting

### Colors Not Updating

**Issue:** Colors don't change when switching themes

**Solution:**
1. Ensure you're using theme-aware classes or context
2. Check that CSS variables are being applied
3. Verify `ThemeProvider` wraps your app in `layout.tsx`

### Transitions Too Slow/Fast

**Issue:** Theme transitions feel sluggish or too quick

**Solution:**
Adjust the transition duration in `globals.css`:

```css
.theme-transition * {
  transition: ... 0.3s ease-in-out; /* Adjust duration */
}
```

### System Theme Not Detecting

**Issue:** Auto theme detection doesn't work

**Solution:**
1. Check browser support for `prefers-color-scheme`
2. Verify system has dark/light mode configured
3. Toggle the "Auto (System)" switch in ThemeSwitcher

---

## 📚 Additional Resources

- **Color Palette Tools:** [Coolors](https://coolors.co), [Adobe Color](https://color.adobe.com)
- **Accessibility:** Ensure 4.5:1 contrast ratio for text
- **Tailwind Colors:** [Tailwind Color Reference](https://tailwindcss.com/docs/customizing-colors)

---

## 🎉 Quick Start Checklist

- [ ] Add `<ThemeSwitcher />` to your layout/navbar
- [ ] Wrap app with `<ThemeProvider>` in `layout.tsx`
- [ ] Use theme-aware CSS classes (`bg-background-primary`, etc.)
- [ ] Test your UI with multiple themes
- [ ] Try keyboard shortcut: `Cmd/Ctrl + Shift + T`
- [ ] Enable system theme detection
- [ ] Customize or create your own theme

---

**Happy Theming! 🎨**
