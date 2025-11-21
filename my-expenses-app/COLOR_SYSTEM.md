# 🎨 Centralized Color System

This project now uses a centralized color system that allows you to change all colors from one file! 

## 📁 Files Structure

```
lib/
├── colors.ts           # Main color configuration
├── theme-context.tsx   # React context for theme management
└── color-utils.ts      # Utility functions for colors

components/
└── ThemeSwitcher.tsx   # Theme switcher component

tailwind.config.ts     # Tailwind configuration with colors
```

## 🚀 Quick Start

### 1. Change Colors Globally

Edit `/lib/colors.ts` and modify the `currentTheme` variable:

```typescript
// Change this line to switch themes
export const currentTheme: ThemeName = 'materialDark'; // 'materialLight' | 'materialDark' | 'materialDynamic'
```

### 2. Create Custom Themes

Add new themes to `/lib/colors.ts`:

```typescript
export const customTheme: ColorTheme = {
  primary: {
    500: '#your-color',
    // ... other shades
  },
  // ... other color categories
};

// Add to themes object
export const themes = {
  materialLight: materialLightTheme,
  materialDark: materialDarkTheme,
  materialDynamic: materialDynamicTheme,
  custom: customTheme, // Add your custom theme
} as const;
```

## 🎯 How to Use Colors

### In React Components

```tsx
import { useTheme } from '@/lib/theme-context';
import { useColors } from '@/lib/color-utils';

function MyComponent() {
  const { theme } = useTheme();
  const colors = useColors();
  
  return (
    <div 
      style={{ 
        backgroundColor: colors.primary[500],
        color: colors.text.primary 
      }}
    >
      Hello World
    </div>
  );
}
```

### In Tailwind Classes

```tsx
// Use the new color classes
<div className="bg-primary-500 text-text-primary border-border-primary">
  Content
</div>

// Or use gradients
<div className="bg-gradient-primary">
  Gradient background
</div>
```

### With CSS Variables

```css
.my-element {
  background-color: var(--color-primary-500);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}
```

## 🎨 Available Color Categories

### Primary Colors
- `primary-50` to `primary-900` - Main brand colors
- Used for: Primary buttons, links, highlights

### Secondary Colors  
- `secondary-50` to `secondary-900` - Supporting colors
- Used for: Secondary buttons, accents

### Accent Colors
- `accent-50` to `accent-900` - Accent colors
- Used for: Special highlights, success states

### Semantic Colors
- `success` - Success messages, positive actions
- `warning` - Warning messages, caution states  
- `error` - Error messages, destructive actions
- `info` - Information messages, neutral states

### Background Colors
- `background-primary` - Main background
- `background-secondary` - Secondary background
- `background-tertiary` - Tertiary background
- `background-glass` - Glass morphism backgrounds
- `background-card` - Card backgrounds

### Text Colors
- `text-primary` - Primary text
- `text-secondary` - Secondary text
- `text-tertiary` - Tertiary text
- `text-inverse` - Inverse text (for dark backgrounds)

### Border Colors
- `border-primary` - Primary borders
- `border-secondary` - Secondary borders
- `border-focus` - Focus state borders
- `border-glass` - Glass morphism borders

## 🔄 Theme Switching

### Add Theme Switcher to Your Component

```tsx
import ThemeSwitcher from '@/components/ThemeSwitcher';

function Header() {
  return (
    <header>
      <ThemeSwitcher showLabel={true} size="md" />
    </header>
  );
}
```

### Programmatic Theme Switching

```tsx
import { useTheme } from '@/lib/theme-context';

function MyComponent() {
  const { setTheme, availableThemes } = useTheme();
  
  const handleThemeChange = (themeName) => {
    setTheme(themeName);
  };
  
  return (
    <div>
      {availableThemes.map(theme => (
        <button key={theme} onClick={() => handleThemeChange(theme)}>
          {theme}
        </button>
      ))}
    </div>
  );
}
```

## 🎨 Pre-built Themes

### Dark Theme (Default)
- Primary: Blue-grey (`#80A1BA`)
- Secondary: Teal (`#91C4C3`) 
- Accent: Mint green (`#B4DEBD`)
- Background: Dark slate

### Light Theme
- Primary: Sky blue (`#0ea5e9`)
- Secondary: Green (`#22c55e`)
- Accent: Pink (`#ec4899`)
- Background: White/light grey

### Ocean Theme
- Primary: Sky blue (`#0ea5e9`)
- Secondary: Cyan (`#06b6d4`)
- Accent: Teal (`#14b8a6`)
- Background: Dark slate

## 🛠️ Advanced Usage

### Custom Color Combinations

```tsx
import { getColorCombinations } from '@/lib/color-utils';

function MyComponent() {
  const { theme } = useTheme();
  const combinations = getColorCombinations(theme);
  
  return (
    <div style={{
      background: combinations.button.primary.background,
      color: combinations.button.primary.text
    }}>
      Primary Button
    </div>
  );
}
```

### Glass Morphism Effects

```tsx
<div className="bg-background-glass border-border-glass backdrop-blur-sm">
  Glass morphism card
</div>
```

### Status Colors

```tsx
<div className="bg-status-success-background text-status-success-text border-status-success-border">
  Success message
</div>
```

## 📝 Migration Guide

### From Hardcoded Colors

**Before:**
```tsx
<div className="bg-[#80A1BA] text-white border-[#91C4C3]">
```

**After:**
```tsx
<div className="bg-primary-500 text-text-primary border-secondary-500">
```

### From CSS Variables

**Before:**
```css
.my-element {
  background: #80A1BA;
  color: #ffffff;
}
```

**After:**
```css
.my-element {
  background: var(--color-primary-500);
  color: var(--color-text-primary);
}
```

## 🎯 Best Practices

1. **Use Semantic Names**: Use `text-primary` instead of `text-white`
2. **Consistent Opacity**: Use `withOpacity()` for transparent colors
3. **Theme-Aware**: Always use theme colors, not hardcoded values
4. **Accessibility**: Ensure sufficient contrast between colors
5. **Testing**: Test all themes to ensure readability

## 🔧 Troubleshooting

### Colors Not Updating
- Check if `ThemeProvider` wraps your app
- Verify `currentTheme` in `/lib/colors.ts`
- Clear browser cache and restart dev server

### Tailwind Classes Not Working
- Run `npm run build` to regenerate Tailwind config
- Check if colors are properly imported in `tailwind.config.ts`

### Theme Not Persisting
- Ensure localStorage is available
- Check browser console for errors
- Verify theme context is properly set up

## 🎨 Creating New Themes

1. Copy an existing theme in `/lib/colors.ts`
2. Modify the color values
3. Add to the `themes` object
4. Update `ThemeName` type if needed
5. Test the new theme thoroughly

---

**Happy Theming! 🎨✨**
