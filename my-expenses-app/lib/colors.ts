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

  // Category colors for charts (repeating pattern)
  categories: [
    PALETTE.blueGrey,
    PALETTE.teal,
    PALETTE.mintGreen,
    "#FFE5B4", // Darker cream/peach
    "#6B8BA4", // Darker blue-grey
    "#7AAFAD", // Darker teal
    "#9AC9A4", // Darker mint
    "#F5ECC8", // Light cream
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
