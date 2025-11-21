/**
 * TypeScript declarations for Material Web Components
 * This allows TypeScript to recognize Material Web custom elements in JSX
 */

declare namespace JSX {
  interface IntrinsicElements {
    // Buttons
    'md-filled-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      href?: string;
      target?: string;
      type?: 'button' | 'submit' | 'reset';
      onClick?: (event: any) => void;
    }, HTMLElement>;
    'md-outlined-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      href?: string;
      target?: string;
      type?: 'button' | 'submit' | 'reset';
      onClick?: (event: any) => void;
    }, HTMLElement>;
    'md-text-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      href?: string;
      target?: string;
      type?: 'button' | 'submit' | 'reset';
      onClick?: (event: any) => void;
    }, HTMLElement>;
    'md-elevated-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      href?: string;
      target?: string;
      type?: 'button' | 'submit' | 'reset';
      onClick?: (event: any) => void;
    }, HTMLElement>;
    'md-filled-tonal-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      href?: string;
      target?: string;
      type?: 'button' | 'submit' | 'reset';
      onClick?: (event: any) => void;
    }, HTMLElement>;

    // Icon Buttons
    'md-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      onClick?: (event: any) => void;
    }, HTMLElement>;
    'md-filled-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      onClick?: (event: any) => void;
    }, HTMLElement>;
    'md-filled-tonal-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      onClick?: (event: any) => void;
    }, HTMLElement>;
    'md-outlined-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      onClick?: (event: any) => void;
    }, HTMLElement>;

    // FAB
    'md-fab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      size?: 'small' | 'medium' | 'large';
      label?: string;
      lowered?: boolean;
      onClick?: (event: any) => void;
    }, HTMLElement>;
    'md-branded-fab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      size?: 'small' | 'medium' | 'large';
      label?: string;
      lowered?: boolean;
      onClick?: (event: any) => void;
    }, HTMLElement>;

    // Text Fields
    'md-filled-text-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      value?: string;
      type?: string;
      required?: boolean;
      disabled?: boolean;
      error?: boolean;
      'error-text'?: string;
      'supporting-text'?: string;
      placeholder?: string;
      maxlength?: number;
      minlength?: number;
      onChange?: (event: any) => void;
      onInput?: (event: any) => void;
    }, HTMLElement>;
    'md-outlined-text-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      value?: string;
      type?: string;
      required?: boolean;
      disabled?: boolean;
      error?: boolean;
      'error-text'?: string;
      'supporting-text'?: string;
      placeholder?: string;
      maxlength?: number;
      minlength?: number;
      onChange?: (event: any) => void;
      onInput?: (event: any) => void;
    }, HTMLElement>;

    // Select
    'md-filled-select': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      value?: string;
      required?: boolean;
      disabled?: boolean;
      onChange?: (event: any) => void;
    }, HTMLElement>;
    'md-outlined-select': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      value?: string;
      required?: boolean;
      disabled?: boolean;
      onChange?: (event: any) => void;
    }, HTMLElement>;
    'md-select-option': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      value?: string;
      selected?: boolean;
      disabled?: boolean;
    }, HTMLElement>;

    // Checkbox, Radio, Switch
    'md-checkbox': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      checked?: boolean;
      indeterminate?: boolean;
      disabled?: boolean;
      value?: string;
      onChange?: (event: any) => void;
    }, HTMLElement>;
    'md-radio': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      checked?: boolean;
      disabled?: boolean;
      value?: string;
      name?: string;
      onChange?: (event: any) => void;
    }, HTMLElement>;
    'md-switch': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      selected?: boolean;
      disabled?: boolean;
      onChange?: (event: any) => void;
    }, HTMLElement>;

    // Chips
    'md-chip-set': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'md-assist-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      disabled?: boolean;
      elevated?: boolean;
    }, HTMLElement>;
    'md-filter-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      disabled?: boolean;
      selected?: boolean;
      removable?: boolean;
    }, HTMLElement>;
    'md-input-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      disabled?: boolean;
      removable?: boolean;
    }, HTMLElement>;
    'md-suggestion-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      label?: string;
      disabled?: boolean;
    }, HTMLElement>;

    // Dialog
    'md-dialog': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      open?: boolean;
      type?: 'alert' | 'confirm';
      onClose?: (event: any) => void;
    }, HTMLElement>;

    // Menu
    'md-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      open?: boolean;
      anchor?: string;
      positioning?: 'absolute' | 'fixed' | 'document' | 'popover';
      onClose?: (event: any) => void;
    }, HTMLElement>;
    'md-menu-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      type?: 'menuitem' | 'option';
      headline?: string;
      'supporting-text'?: string;
      onClick?: (event: any) => void;
    }, HTMLElement>;
    'md-sub-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'menu-corner'?: string;
      'anchor-corner'?: string;
    }, HTMLElement>;

    // List
    'md-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'md-list-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      disabled?: boolean;
      type?: 'text' | 'button' | 'link';
      href?: string;
      target?: string;
      headline?: string;
      'supporting-text'?: string;
      onClick?: (event: any) => void;
    }, HTMLElement>;

    // Divider
    'md-divider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      inset?: boolean;
      'inset-start'?: boolean;
      'inset-end'?: boolean;
    }, HTMLElement>;

    // Progress
    'md-circular-progress': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      value?: number;
      max?: number;
      indeterminate?: boolean;
      'four-color'?: boolean;
    }, HTMLElement>;
    'md-linear-progress': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      value?: number;
      max?: number;
      buffer?: number;
      indeterminate?: boolean;
      'four-color'?: boolean;
    }, HTMLElement>;

    // Slider
    'md-slider': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      value?: number;
      'value-start'?: number;
      'value-end'?: number;
      min?: number;
      max?: number;
      step?: number;
      disabled?: boolean;
      labeled?: boolean;
      range?: boolean;
      onChange?: (event: any) => void;
      onInput?: (event: any) => void;
    }, HTMLElement>;

    // Tabs
    'md-tabs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      'active-tab-index'?: number;
      onChange?: (event: any) => void;
    }, HTMLElement>;
    'md-primary-tab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      active?: boolean;
      'inline-icon'?: boolean;
    }, HTMLElement>;
    'md-secondary-tab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
      active?: boolean;
      'inline-icon'?: boolean;
    }, HTMLElement>;

    // Ripple
    'md-ripple': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

    // Icon
    'md-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
