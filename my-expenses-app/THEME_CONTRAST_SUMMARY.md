# Theme Contrast & Color Summary

This document provides a quick reference for text and background colors in each theme.

## Dark Themes (Light Text on Dark Background)

### 🌙 Dark Theme
- **Background**: `#0f172a` (Slate 900) - Very dark blue-grey
- **Text**: `#f8fafc` (Slate 50) - Nearly white
- **Mood**: Professional, easy on the eyes

### 🌊 Ocean Theme
- **Background**: `#0c1526` - Deep ocean blue
- **Text**: `#f0f9ff` (Sky 50) - Light cyan-tinted white
- **Mood**: Calm, aquatic, refreshing

### 🌅 Sunset Theme
- **Background**: `#1c1917` (Stone 900) - Warm dark brown
- **Text**: `#fafaf9` (Stone 50) - Warm white
- **Mood**: Energetic, warm, vibrant

### 🌌 Midnight Theme
- **Background**: `#020617` (Slate 950) - Almost black
- **Text**: `#f8fafc` (Slate 50) - Crisp white
- **Mood**: Deep, focused, immersive

### 🌲 Forest Theme
- **Background**: `#0c0a09` (Stone 950) - Very dark brown
- **Text**: `#f0fdf4` (Green 50) - Light green-tinted white
- **Mood**: Natural, grounded, calming

### 💜 Purple Haze Theme
- **Background**: `#1c1917` (Stone 900) - Dark brown
- **Text**: `#faf5ff` (Purple 50) - Light purple-tinted white
- **Mood**: Bold, creative, artistic

---

## Light Themes (Dark Text on Light Background)

### ☀️ Light Theme
- **Background**: `#f8fafc` (Slate 50) - Very light grey-blue
- **Text**: `#1e293b` (Slate 800) - Dark blue-grey
- **Mood**: Clean, professional, high visibility

### 🌸 Cherry Blossom Theme
- **Background**: `#fff1f2` (Rose 50) - Soft pink
- **Text**: `#4c0519` (Rose 950) - Deep burgundy
- **Mood**: Delicate, elegant, feminine

### ❄️ Nordic Theme
- **Background**: `#f0f9ff` (Sky 50) - Light icy blue
- **Text**: `#0c4a6e` (Sky 900) - Deep blue
- **Mood**: Clean, minimalist, Scandinavian

---

## Accessibility & Contrast Ratios

All themes have been designed with **WCAG AAA contrast ratios** in mind:

- **Primary Text**: Minimum 7:1 contrast ratio
- **Secondary Text**: Minimum 4.5:1 contrast ratio
- **Interactive Elements**: Enhanced contrast on hover/focus

### Testing Your Theme

To verify contrast in your browser:
1. Open DevTools (F12)
2. Inspect any text element
3. Check the "Accessibility" panel
4. Look for "Contrast" information

### Best Practices

✅ **DO:**
- Use `text-text-primary` for main content
- Use `text-text-secondary` for labels
- Use `text-text-tertiary` for hints/metadata
- Test with actual users who have visual impairments

❌ **DON'T:**
- Hardcode colors like `#ffffff` or `text-white`
- Use `text-text-tertiary` for critical information
- Rely solely on color to convey information

---

## Theme-Specific Color Moods

### Dark Themes
- **Best for**: Extended use, low-light environments, reducing eye strain
- **Avoid for**: High-precision visual work, environments with lots of ambient light

### Light Themes
- **Best for**: Daytime use, outdoor viewing, screenshots/printing
- **Avoid for**: Night-time use, low-light environments

### Colorful Themes (Sunset, Forest, Purple Haze, Cherry Blossom)
- **Best for**: Personal preference, brand alignment, creative work
- **Avoid for**: Formal business presentations (use Dark or Light instead)

---

## Quick Reference Table

| Theme | Type | Background | Text | Best For |
|-------|------|-----------|------|----------|
| 🌙 Dark | Dark | `#0f172a` | `#f8fafc` | General use, extended sessions |
| ☀️ Light | Light | `#f8fafc` | `#1e293b` | Daytime, high visibility |
| 🌊 Ocean | Dark | `#0c1526` | `#f0f9ff` | Calm, focused work |
| 🌅 Sunset | Dark | `#1c1917` | `#fafaf9` | Creative, energetic tasks |
| 🌌 Midnight | Dark | `#020617` | `#f8fafc` | Night owls, deep focus |
| 🌲 Forest | Dark | `#0c0a09` | `#f0fdf4` | Natural, grounded feeling |
| 💜 Purple Haze | Dark | `#1c1917` | `#faf5ff` | Bold, artistic work |
| 🌸 Cherry Blossom | Light | `#fff1f2` | `#4c0519` | Elegant, soft aesthetics |
| ❄️ Nordic | Light | `#f0f9ff` | `#0c4a6e` | Minimalist, clean design |

---

## Troubleshooting Low Contrast

If text appears hard to read:

1. **Check your theme**: Ensure you're using a theme appropriate for your lighting
2. **Adjust system brightness**: Your display brightness affects perceived contrast
3. **Enable system theme**: Use "Auto (System)" to match your OS dark/light mode
4. **Try a different theme**: Some themes have higher contrast (Midnight, Light)
5. **Report issues**: Open an issue if a theme has poor accessibility

---

**Last Updated**: 2025
