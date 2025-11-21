/**
 * TypeScript declarations for Material Web Components
 * https://github.com/material-components/material-web
 */

import { HTMLAttributes, DetailedHTMLProps } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Buttons
      'md-filled-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
      }, HTMLElement>;

      'md-outlined-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
      }, HTMLElement>;

      'md-text-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
      }, HTMLElement>;

      'md-elevated-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
      }, HTMLElement>;

      'md-filled-tonal-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        type?: 'button' | 'submit' | 'reset';
      }, HTMLElement>;

      // FAB (Floating Action Button)
      'md-fab': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
        size?: 'small' | 'medium' | 'large';
        label?: string;
        lowered?: boolean;
      }, HTMLElement>;

      // Icon Button
      'md-icon-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        toggle?: boolean;
        selected?: boolean;
      }, HTMLElement>;

      'md-filled-icon-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        toggle?: boolean;
        selected?: boolean;
      }, HTMLElement>;

      'md-filled-tonal-icon-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        toggle?: boolean;
        selected?: boolean;
      }, HTMLElement>;

      'md-outlined-icon-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        toggle?: boolean;
        selected?: boolean;
      }, HTMLElement>;

      // Checkbox
      'md-checkbox': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        checked?: boolean;
        indeterminate?: boolean;
        disabled?: boolean;
        value?: string;
        name?: string;
        required?: boolean;
      }, HTMLElement>;

      // Radio
      'md-radio': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        checked?: boolean;
        disabled?: boolean;
        value?: string;
        name?: string;
      }, HTMLElement>;

      // Switch
      'md-switch': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        selected?: boolean;
        disabled?: boolean;
        icons?: boolean;
        'show-only-selected-icon'?: boolean;
        value?: string;
        name?: string;
      }, HTMLElement>;

      // Text Field
      'md-filled-text-field': DetailedHTMLProps<HTMLAttributes<HTMLInputElement> & {
        disabled?: boolean;
        error?: boolean;
        'error-text'?: string;
        label?: string;
        required?: boolean;
        value?: string;
        'prefix-text'?: string;
        'suffix-text'?: string;
        'has-leading-icon'?: boolean;
        'has-trailing-icon'?: boolean;
        'supporting-text'?: string;
        'text-counter'?: boolean;
        max?: string | number;
        maxlength?: number;
        min?: string | number;
        minlength?: number;
        pattern?: string;
        placeholder?: string;
        readonly?: boolean;
        multiple?: boolean;
        step?: string;
        type?: string;
        autocomplete?: string;
      }, HTMLInputElement>;

      'md-outlined-text-field': DetailedHTMLProps<HTMLAttributes<HTMLInputElement> & {
        disabled?: boolean;
        error?: boolean;
        'error-text'?: string;
        label?: string;
        required?: boolean;
        value?: string;
        'prefix-text'?: string;
        'suffix-text'?: string;
        'has-leading-icon'?: boolean;
        'has-trailing-icon'?: boolean;
        'supporting-text'?: string;
        'text-counter'?: boolean;
        max?: string | number;
        maxlength?: number;
        min?: string | number;
        minlength?: number;
        pattern?: string;
        placeholder?: string;
        readonly?: boolean;
        multiple?: boolean;
        step?: string;
        type?: string;
        autocomplete?: string;
      }, HTMLInputElement>;

      // Select
      'md-filled-select': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        error?: boolean;
        'error-text'?: string;
        label?: string;
        required?: boolean;
        value?: string;
        'selected-index'?: number;
        'display-text'?: string;
        'menu-align'?: 'start' | 'end';
        'supporting-text'?: string;
      }, HTMLElement>;

      'md-outlined-select': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        error?: boolean;
        'error-text'?: string;
        label?: string;
        required?: boolean;
        value?: string;
        'selected-index'?: number;
        'display-text'?: string;
        'menu-align'?: 'start' | 'end';
        'supporting-text'?: string;
      }, HTMLElement>;

      'md-select-option': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        selected?: boolean;
        value?: string;
        headline?: string;
        'supporting-text'?: string;
      }, HTMLElement>;

      // Slider
      'md-slider': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        min?: number;
        max?: number;
        value?: number;
        'value-start'?: number;
        'value-end'?: number;
        'value-label'?: string;
        'value-label-start'?: string;
        'value-label-end'?: string;
        step?: number;
        ticks?: boolean;
        labeled?: boolean;
        range?: boolean;
        name?: string;
        'name-start'?: string;
        'name-end'?: string;
      }, HTMLElement>;

      // Chips
      'md-assist-chip': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        elevated?: boolean;
        href?: string;
        target?: string;
        label?: string;
      }, HTMLElement>;

      'md-filter-chip': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        elevated?: boolean;
        selected?: boolean;
        label?: string;
        removable?: boolean;
      }, HTMLElement>;

      'md-input-chip': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        selected?: boolean;
        label?: string;
        'remove-only'?: boolean;
        avatar?: boolean;
      }, HTMLElement>;

      'md-suggestion-chip': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        elevated?: boolean;
        href?: string;
        target?: string;
        label?: string;
      }, HTMLElement>;

      // Dialog
      'md-dialog': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        open?: boolean;
        'quick-open'?: boolean;
        'return-value'?: string;
        type?: 'alert' | 'confirm' | 'prompt';
        'no-focus-trap'?: boolean;
      }, HTMLElement>;

      // Divider
      'md-divider': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        inset?: boolean;
        'inset-start'?: boolean;
        'inset-end'?: boolean;
      }, HTMLElement>;

      // List
      'md-list': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

      'md-list-item': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        type?: 'text' | 'button' | 'link';
        href?: string;
        target?: string;
        headline?: string;
        'supporting-text'?: string;
        'trailing-supporting-text'?: string;
      }, HTMLElement>;

      // Menu
      'md-menu': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        open?: boolean;
        'quick-open'?: boolean;
        'anchor-corner'?: string;
        'menu-corner'?: string;
        'default-focus'?: string;
        'skip-restore-focus'?: boolean;
        'stay-open-on-outside-click'?: boolean;
        'stay-open-on-focusout'?: boolean;
        'x-offset'?: number;
        'y-offset'?: number;
      }, HTMLElement>;

      'md-menu-item': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        type?: 'text' | 'button' | 'link';
        href?: string;
        target?: string;
        headline?: string;
        'supporting-text'?: string;
        'trailing-supporting-text'?: string;
        'keep-open'?: boolean;
      }, HTMLElement>;

      'md-sub-menu': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        'anchor-corner'?: string;
        'menu-corner'?: string;
        'hover-open-delay'?: number;
        'hover-close-delay'?: number;
      }, HTMLElement>;

      // Progress
      'md-circular-progress': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        value?: number;
        max?: number;
        indeterminate?: boolean;
        'four-color'?: boolean;
      }, HTMLElement>;

      'md-linear-progress': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        value?: number;
        max?: number;
        buffer?: number;
        indeterminate?: boolean;
        'four-color'?: boolean;
      }, HTMLElement>;

      // Tabs
      'md-tabs': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        'auto-activate'?: boolean;
        'active-tab-index'?: number;
      }, HTMLElement>;

      'md-primary-tab': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        active?: boolean;
        'icon-only'?: boolean;
        'inline-icon'?: boolean;
        'has-icon'?: boolean;
        'aria-label'?: string;
      }, HTMLElement>;

      'md-secondary-tab': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        active?: boolean;
        'icon-only'?: boolean;
        'has-icon'?: boolean;
        'aria-label'?: string;
      }, HTMLElement>;

      // Icon
      'md-icon': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

      // Ripple
      'md-ripple': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
      }, HTMLElement>;
    }
  }
}

export {};
