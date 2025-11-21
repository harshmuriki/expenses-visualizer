/**
 * Re-export commonly used MUI components with theme integration
 * This file provides easy access to Material UI components that are
 * already styled with the custom theme system.
 */

export {
  // Layout
  Box,
  Container,
  Grid,
  Stack,
  
  // Typography
  Typography,
  
  // Buttons
  Button,
  IconButton,
  ButtonGroup,
  
  // Cards
  Card,
  CardContent,
  CardActions,
  CardHeader,
  CardMedia,
  
  // Inputs
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  Switch,
  
  // Navigation
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  
  // Feedback
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  LinearProgress,
  Backdrop,
  
  // Data Display
  Chip,
  Avatar,
  Badge,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  
  // Surfaces
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  
  // Utils
  CssBaseline,
  ThemeProvider,
} from '@mui/material';

export type {
  Theme,
  SxProps,
  Theme as MuiTheme,
} from '@mui/material/styles';

// Re-export commonly used icons
export {
  // Navigation
  Menu as MenuIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  
  // Actions
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Check as CheckIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  
  // Content
  Upload as UploadIcon,
  Download as DownloadIcon,
  FileUpload as FileUploadIcon,
  CloudUpload as CloudUploadIcon,
  
  // Social
  Person as PersonIcon,
  AccountCircle as AccountCircleIcon,
  
  // Analytics
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  
  // Settings
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  MoreHoriz as MoreHorizIcon,
  
  // Status
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  
  // Other
  Bolt as BoltIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
