# Material UI Integration Guide

This project now uses Material UI (MUI) components integrated with the existing custom theme system. All MUI components automatically use your custom color themes (Ocean, Cherry Blossom, Nordic).

## Setup

Material UI is already configured and ready to use. The theme automatically syncs with your custom theme context, so when you switch themes, all MUI components update accordingly.

## Using MUI Components

### Basic Example

```tsx
import { Button, Card, CardContent, Typography } from '@mui/material';

export default function MyComponent() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h5">Hello World</Typography>
        <Button variant="contained">Click Me</Button>
      </CardContent>
    </Card>
  );
}
```

### Using Icons

```tsx
import { Upload, Person, TrendingUp } from '@mui/icons-material';
import { Button } from '@mui/material';

<Button startIcon={<Upload />}>Upload File</Button>
```

### Using Theme Colors

MUI components automatically use your theme colors. You can also access theme colors directly:

```tsx
import { Box } from '@mui/material';

<Box
  sx={{
    backgroundColor: 'primary.main',
    color: 'text.primary',
    border: '1px solid',
    borderColor: 'border.focus',
  }}
>
  Themed Box
</Box>
```

## Available Theme Colors

All MUI components support these theme color paths:

- `primary.main`, `primary.light`, `primary.dark`
- `secondary.main`, `secondary.light`, `secondary.dark`
- `accent.main` (via custom theme)
- `background.default`, `background.paper`
- `text.primary`, `text.secondary`, `text.disabled`
- `error.main`, `warning.main`, `info.main`, `success.main`
- `border.secondary`, `border.focus` (via custom theme)

## Styled Components

MUI components are pre-styled with:
- Glassmorphism effects (backdrop blur, transparency)
- Smooth transitions and hover effects
- Rounded corners (12px default, 24px for cards)
- Gradient buttons
- Theme-aware colors

## Common Components

### Buttons

```tsx
<Button variant="contained">Primary Button</Button>
<Button variant="outlined">Outlined Button</Button>
<Button variant="text">Text Button</Button>
```

### Cards

```tsx
<Card>
  <CardContent>
    <Typography variant="h6">Card Title</Typography>
    <Typography variant="body2">Card content</Typography>
  </CardContent>
</Card>
```

### Text Fields

```tsx
<TextField
  label="Email"
  variant="outlined"
  fullWidth
/>
```

### Select Dropdowns

```tsx
<FormControl fullWidth>
  <InputLabel>Theme</InputLabel>
  <Select value={value} onChange={handleChange}>
    <MenuItem value="option1">Option 1</MenuItem>
    <MenuItem value="option2">Option 2</MenuItem>
  </Select>
</FormControl>
```

## Theme Switching

The MUI theme automatically updates when you use the `ThemeSwitcher` component or change themes programmatically. No additional code needed!

## Custom Styling

You can override MUI component styles using the `sx` prop:

```tsx
<Button
  sx={{
    borderRadius: 3,
    px: 4,
    py: 2,
    background: 'linear-gradient(45deg, primary.main, secondary.main)',
  }}
>
  Custom Button
</Button>
```

## Integration with Existing Code

You can mix MUI components with your existing Tailwind CSS classes:

```tsx
<Card className="my-custom-class">
  <CardContent>
    <Typography className="text-xl font-bold">
      Mixed Styling
    </Typography>
  </CardContent>
</Card>
```

## Best Practices

1. **Use MUI components for interactive elements**: Buttons, inputs, dialogs, etc.
2. **Use Tailwind for layout**: Grid, flexbox, spacing
3. **Leverage theme colors**: Use `sx` prop with theme color paths
4. **Maintain consistency**: Use MUI Typography variants for text
5. **Accessibility**: MUI components include built-in accessibility features

## Files

- `lib/mui-theme.tsx` - MUI theme configuration
- `lib/mui-theme-provider.tsx` - Theme provider wrapper
- `lib/mui-components.tsx` - Re-exported components for convenience
