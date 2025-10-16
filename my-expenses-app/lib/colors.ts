// Custom Color Palette
// Beautiful pastel color scheme for the expense visualizer

export const PALETTE = {
  blueGrey: "#80A1BA", // rgb(128, 161, 186)
  teal: "#91C4C3", // rgb(145, 196, 195)
  mintGreen: "#B4DEBD", // rgb(180, 222, 189)
  cream: "#FFF7DD", // rgb(255, 247, 221)
};

// Extended palette with variations
export const COLORS = {
  primary: PALETTE.blueGrey,
  secondary: PALETTE.teal,
  success: PALETTE.mintGreen,
  accent: PALETTE.cream,

  // Category colors for charts (repeating pattern) - Beautiful Pastels
  categories: [
    "#A8DADC", // Pastel Blue
    "#F1FAEE", // Pastel Mint
    "#E9C46A", // Pastel Gold
    "#F4ACB7", // Pastel Pink
    "#D4A5A5", // Pastel Mauve
    "#9DD9D2", // Pastel Teal
    "#FFC6A4", // Pastel Peach
    "#B8D4E3", // Pastel Sky Blue
    "#E8D6CB", // Pastel Tan
    "#C7B8EA", // Pastel Lavender
    "#B5D99C", // Pastel Green
    "#FFD6A5", // Pastel Orange
  ],

  // Darker versions for hover/active states
  blueGreyDark: "#6B8BA4",
  tealDark: "#7AAFAD",
  mintGreenDark: "#9AC9A4",
  creamDark: "#F5ECC8",

  // Lighter versions for backgrounds
  blueGreyLight: "#C2D4E0",
  tealLight: "#C8E5E4",
  mintGreenLight: "#D9EDDE",
  creamLight: "#FFFBEE",
};

// Tailwind-compatible color export
export const tailwindColors = {
  brand: {
    primary: PALETTE.blueGrey,
    secondary: PALETTE.teal,
    success: PALETTE.mintGreen,
    accent: PALETTE.cream,
    "primary-dark": COLORS.blueGreyDark,
    "secondary-dark": COLORS.tealDark,
    "success-dark": COLORS.mintGreenDark,
    "accent-dark": COLORS.creamDark,
    "primary-light": COLORS.blueGreyLight,
    "secondary-light": COLORS.tealLight,
    "success-light": COLORS.mintGreenLight,
    "accent-light": COLORS.creamLight,
  },
};
