# Material Web Redesign

This document describes the Material Web redesign implemented for the Expenses Visualizer application.

## Overview

The application has been redesigned using [Material Web](https://material-web.dev/), Google's official web components library that implements Material Design 3. This redesign brings a modern, polished UI while maintaining the existing functionality and theme system.

## What Changed

### 1. Dependencies

**Added:**
- `@material/web` - Material Web components library

### 2. New Files Created

#### Theme Configuration
- **`lib/material-theme.css`** - Complete Material Design 3 theme configuration
  - Color palette tokens (primary, secondary, tertiary, neutral, error)
  - Typography scale (display, headline, title, body, label)
  - Shape tokens (corner radii)
  - Elevation tokens (shadows)
  - Light and dark theme support
  - Utility classes for typography and surfaces

#### Material Web Integration
- **`lib/material-imports.ts`** - Centralized imports for all Material Web components
  - Buttons (filled, outlined, text, elevated, tonal)
  - Text fields (filled, outlined)
  - Icon buttons and FABs
  - Select, checkbox, radio, switch
  - Chips, dialogs, menus, lists
  - Progress indicators, sliders, tabs
  - And more!

#### TypeScript Declarations
- **`types/material-web.d.ts`** - TypeScript definitions for Material Web custom elements
  - Enables proper type checking in JSX
  - Includes all component props and events

### 3. Updated Files

#### Core Application
- **`app/layout.tsx`** - Added Material theme CSS import
- **`app/globals.css`** - Added Material Web integration styles
  - Component theming to match existing design system
  - Custom CSS properties for all Material components
  - Glassmorphism + Material Design fusion

#### Homepage
- **`app/page.tsx`** - Redesigned with Material components
  - Material typography classes (md-display-large, md-headline-*, md-title-*, md-body-*)
  - Material Web buttons (md-filled-button, md-filled-tonal-button)
  - Maintained existing visual design while using Material components

#### Main Chart Interface
- **`components/SnakeyChartComponent.tsx`** - Updated with Material components
  - Replaced custom buttons with Material Web buttons
  - Added Material circular progress for loading states
  - Updated settings button with md-text-button
  - Floating action buttons now use md-filled-button

#### Upload Component
- **`components/uploadComponent.tsx`** - Complete form redesign
  - md-outlined-text-field for month input
  - md-filled-button for upload action
  - md-list and md-list-item for previous months
  - md-circular-progress for loading states

## Material Design Integration

### Color System
The Material theme integrates seamlessly with the existing theme system:
- Primary: Cyan/Blue tones
- Secondary: Blue-gray tones
- Tertiary: Purple tones
- All colors available in light and dark variants

### Typography Scale
Material Design's type scale is now available throughout the app:
- **Display** (large, medium, small) - Hero text
- **Headline** (large, medium, small) - Section headers
- **Title** (large, medium, small) - Card and component titles
- **Body** (large, medium, small) - Main content
- **Label** (large, medium, small) - UI labels and buttons

### Component Theming
All Material Web components are themed to match the existing design:
- Custom CSS properties integrate with theme context
- Glassmorphism effects on dialogs and menus
- Rounded corners throughout (12px - 28px)
- Smooth animations and transitions
- Proper elevation (shadows) for depth

## Usage Examples

### Buttons
```tsx
// Filled button (primary action)
<md-filled-button onClick={handleClick}>
  <FiIcon slot="icon" />
  Button Text
</md-filled-button>

// Tonal button (secondary action)
<md-filled-tonal-button>Save</md-filled-tonal-button>

// Outlined button
<md-outlined-button>Cancel</md-outlined-button>

// Text button (tertiary action)
<md-text-button>Learn More</md-text-button>
```

### Text Fields
```tsx
// Outlined text field
<md-outlined-text-field
  label="Label"
  value={value}
  onInput={(e) => setValue(e.target.value)}
  supporting-text="Helper text"
/>

// Filled text field
<md-filled-text-field
  label="Label"
  type="email"
  required
/>
```

### Progress Indicators
```tsx
// Circular progress
<md-circular-progress indeterminate />

// Linear progress
<md-linear-progress value={50} max={100} />
```

### Lists
```tsx
<md-list>
  <md-list-item type="button" onClick={handleClick}>
    <div slot="headline">Item Title</div>
    <div slot="supporting-text">Item description</div>
  </md-list-item>
</md-list>
```

## Benefits

1. **Consistency** - Material Design provides a cohesive design language
2. **Accessibility** - All components follow WCAG guidelines
3. **Performance** - Web components are lightweight and efficient
4. **Maintainability** - Less custom CSS to maintain
5. **Future-proof** - Built on web standards
6. **Responsive** - All components adapt to different screen sizes
7. **Themeable** - Fully customizable via CSS custom properties

## Theme Customization

To customize the theme, edit `lib/material-theme.css`:

```css
:root {
  /* Change primary color */
  --md-sys-color-primary: #your-color;

  /* Change shape (border radius) */
  --md-sys-shape-corner-large: 20px;

  /* Change typography */
  --md-ref-typeface-brand: 'Your Font', sans-serif;
}
```

## Browser Support

Material Web components work in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

## Next Steps

Potential future enhancements:
1. Replace remaining custom components with Material equivalents
2. Add Material navigation rail or drawer
3. Implement Material data tables
4. Add Material snackbars for notifications
5. Use Material dialogs for modals
6. Implement Material cards for better content organization

## Resources

- [Material Web Documentation](https://material-web.dev/)
- [Material Design 3 Guidelines](https://m3.material.io/)
- [Material Theme Builder](https://m3.material.io/theme-builder)
- [Material Icons](https://fonts.google.com/icons)

## Migration Notes

The redesign maintains 100% backwards compatibility:
- All existing functionality preserved
- Existing theme system still works
- Can mix Material and custom components
- No breaking changes to data structures or APIs
