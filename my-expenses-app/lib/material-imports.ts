/**
 * Material Web Component Imports
 *
 * This file loads Material Web components dynamically for client-side use.
 * Import this file in client components that use Material Web elements.
 */

// This function loads all Material Web components
export function loadMaterialComponents() {
  if (typeof window === 'undefined') return;

  // Buttons
  import('@material/web/button/filled-button.js');
  import('@material/web/button/outlined-button.js');
  import('@material/web/button/text-button.js');
  import('@material/web/button/elevated-button.js');
  import('@material/web/button/filled-tonal-button.js');

  // Icon Buttons
  import('@material/web/iconbutton/icon-button.js');
  import('@material/web/iconbutton/filled-icon-button.js');
  import('@material/web/iconbutton/filled-tonal-icon-button.js');
  import('@material/web/iconbutton/outlined-icon-button.js');

  // FAB (Floating Action Button)
  import('@material/web/fab/fab.js');
  import('@material/web/fab/branded-fab.js');

  // Text Fields
  import('@material/web/textfield/filled-text-field.js');
  import('@material/web/textfield/outlined-text-field.js');

  // Select
  import('@material/web/select/filled-select.js');
  import('@material/web/select/outlined-select.js');
  import('@material/web/select/select-option.js');

  // Checkbox
  import('@material/web/checkbox/checkbox.js');

  // Radio
  import('@material/web/radio/radio.js');

  // Switch
  import('@material/web/switch/switch.js');

  // Chips
  import('@material/web/chips/chip-set.js');
  import('@material/web/chips/assist-chip.js');
  import('@material/web/chips/filter-chip.js');
  import('@material/web/chips/input-chip.js');
  import('@material/web/chips/suggestion-chip.js');

  // Dialog
  import('@material/web/dialog/dialog.js');

  // Menu
  import('@material/web/menu/menu.js');
  import('@material/web/menu/menu-item.js');
  import('@material/web/menu/sub-menu.js');

  // List
  import('@material/web/list/list.js');
  import('@material/web/list/list-item.js');

  // Divider
  import('@material/web/divider/divider.js');

  // Progress indicators
  import('@material/web/progress/circular-progress.js');
  import('@material/web/progress/linear-progress.js');

  // Slider
  import('@material/web/slider/slider.js');

  // Tabs
  import('@material/web/tabs/tabs.js');
  import('@material/web/tabs/primary-tab.js');
  import('@material/web/tabs/secondary-tab.js');

  // Ripple (for interactive effects)
  import('@material/web/ripple/ripple.js');

  // Icon
  import('@material/web/icon/icon.js');
}

export default {};
