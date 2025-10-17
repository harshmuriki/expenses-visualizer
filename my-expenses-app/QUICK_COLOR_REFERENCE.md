# 🎨 Quick Color Reference

## 🚀 How to Change All Colors

### 1. **Change Theme Globally**

Edit `/lib/colors.ts`:

```typescript
export const currentTheme: ThemeName = "ocean"; // 'dark' | 'light' | 'ocean'
```

### 2. **Create Custom Theme**

Add to `/lib/colors.ts`:

```typescript
export const myTheme: ColorTheme = {
  primary: { 500: "#your-color" /* ... */ },
  // ... other colors
};
```

## 🎯 Common Color Replacements

### **Before (Hardcoded) → After (Theme)**

```tsx
// ❌ Old way
<div className="bg-[#80A1BA] text-white border-[#91C4C3]">

// ✅ New way
<div className="bg-primary-500 text-text-primary border-secondary-500">
```

### **Hex Colors → Theme Colors**

```tsx
// ❌ Hardcoded hex
style={{ backgroundColor: '#80A1BA' }}

// ✅ Theme colors
style={{ backgroundColor: colors.primary[500] }}
```

## 🎨 Available Color Classes

### **Primary Colors**

- `bg-primary-500` - Main primary color
- `text-primary-500` - Primary text color
- `border-primary-500` - Primary border

### **Background Colors**

- `bg-background-primary` - Main background
- `bg-background-glass` - Glass morphism
- `bg-background-card` - Card background

### **Text Colors**

- `text-text-primary` - Primary text
- `text-text-secondary` - Secondary text
- `text-text-tertiary` - Tertiary text

### **Gradients**

- `bg-gradient-primary` - Primary gradient
- `bg-gradient-secondary` - Secondary gradient
- `bg-gradient-accent` - Accent gradient

## 🔧 Quick Migration

### **Run Migration Script**

```bash
node scripts/migrate-colors.js
```

### **Manual Replacements**

| Old            | New                     |
| -------------- | ----------------------- |
| `#80A1BA`      | `colors.primary[500]`   |
| `#91C4C3`      | `colors.secondary[500]` |
| `#B4DEBD`      | `colors.accent[500]`    |
| `bg-slate-900` | `bg-background-primary` |
| `text-white`   | `text-text-primary`     |

## 🎯 Component Examples

### **Button with Theme Colors**

```tsx
import { useColors } from "@/lib/color-utils";

function MyButton() {
  const colors = useColors();

  return (
    <button
      className="px-4 py-2 rounded-lg"
      style={{
        background: colors.primary[500],
        color: colors.text.primary,
      }}
    >
      Click me
    </button>
  );
}
```

### **Glass Morphism Card**

```tsx
<div className="bg-background-glass border-border-glass backdrop-blur-sm">
  Glass card
</div>
```

### **Status Messages**

```tsx
<div className="bg-status-success-background text-status-success-text">
  Success message
</div>
```

## 🎨 Theme Switcher

### **Add to Any Component**

```tsx
import ThemeSwitcher from "@/components/ThemeSwitcher";

<ThemeSwitcher showLabel={true} size="md" />;
```

### **Programmatic Theme Change**

```tsx
import { useTheme } from "@/lib/theme-context";

const { setTheme } = useTheme();
setTheme("ocean"); // 'dark' | 'light' | 'ocean'
```

## 🚨 Common Issues

### **Colors Not Updating**

- Check if `ThemeProvider` wraps your app
- Verify `currentTheme` in `/lib/colors.ts`
- Restart dev server

### **Tailwind Classes Not Working**

- Run `npm run build` to regenerate config
- Check if colors are imported in `tailwind.config.ts`

---

**Need help?** Check the full documentation in `COLOR_SYSTEM.md` 📚
