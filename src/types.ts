import React from 'react';

export type Option = {
  label: string;
  value: string | number;
  disabled?: boolean;
  /** Optional group key for grouped options */
  group?: string;
  /** Optional icon (emoji, url, or React node) */
  icon?: string | React.ReactNode;
  /** Optional description / secondary text */
  description?: string;
  /** Nested children for hierarchical options */
  children?: Option[];
  /** Arbitrary extra data */
  [key: string]: unknown;
};

export type MultiDisplayMode = 'all' | 'count';

export type FilterMode = 'includes' | 'startsWith' | 'exact';

export type SortMode = 'none' | 'asc' | 'desc' | 'custom';

export type MenuPlacement = 'bottom' | 'top' | 'auto';

export interface GroupedOption {
  label: string;
  options: Option[];
}

export interface SmartSelectProps {
  /** Available options (flat or with group/children) */
  options: Option[];
  /** Selected value(s) */
  value?: Option | Option[] | null;
  /** Called when selection changes */
  onChange?: (value: Option | Option[] | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Allow selecting multiple options */
  isMulti?: boolean;
  /** Allow creating new options from free text */
  isCreatable?: boolean;
  /** How to display selected items when isMulti=true */
  multiDisplayMode?: MultiDisplayMode;
  /** Max chips before switching to count mode */
  maxChipsToShow?: number;
  /** Disable the whole control */
  isDisabled?: boolean;
  /** Show a clear (×) button */
  isClearable?: boolean;
  /** Allow searching / filtering options */
  isSearchable?: boolean;
  /** Show checkboxes next to options (multi) */
  showCheckboxes?: boolean;
  /** Show "Select all / Deselect all" action */
  showSelectAll?: boolean;
  /** Maximum number of selections allowed (multi) */
  maxSelections?: number;
  /** Async loading state */
  isLoading?: boolean;
  /** Custom loading message */
  loadingMessage?: string;
  /** Custom no-options message */
  noOptionsMessage?: string | ((inputValue: string) => string);
  /** Filter strategy */
  filterMode?: FilterMode;
  /** Custom filter function – overrides filterMode */
  filterOption?: (option: Option, inputValue: string) => boolean;
  /** Sort options */
  sortMode?: SortMode;
  /** Custom sort comparator */
  sortFn?: (a: Option, b: Option) => number;
  /** Select highlighted option on blur */
  selectOnBlur?: boolean;
  /** Close menu after selecting (multi defaults to false) */
  closeMenuOnSelect?: boolean;
  /** Hide already-selected options from the list (multi) */
  hideSelectedOptions?: boolean;
  /** Menu placement */
  menuPlacement?: MenuPlacement;
  /** Fixed menu width (px or css) */
  menuWidth?: string | number;
  /** Custom option renderer */
  formatOptionLabel?: (option: Option, meta: { context: 'menu' | 'value'; isSelected: boolean }) => React.ReactNode;
  /** Custom group header renderer */
  formatGroupLabel?: (group: GroupedOption) => React.ReactNode;
  /** Label for the "create" action */
  formatCreateLabel?: (inputValue: string) => string;
  /** Called when a new option is created */
  onCreateOption?: (inputValue: string) => void;
  /** Called when input value changes (useful for async search) */
  onInputChange?: (inputValue: string) => void;
  /** Called when menu opens / closes */
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
  /** Called when user scrolls near bottom (infinite scroll) */
  onMenuScrollToBottom?: () => void;
  /** Error / validation message */
  error?: string | boolean;
  /** Required field (for a11y) */
  required?: boolean;
  /** Id for accessibility */
  id?: string;
  /** Name attribute */
  name?: string;
  /** aria-label */
  'aria-label'?: string;
  /** Custom class names */
  className?: string;
  controlClassName?: string;
  menuClassName?: string;
  /** Theme / size */
  size?: 'sm' | 'md' | 'lg';
  /** Direction for RTL */
  dir?: 'ltr' | 'rtl';
  /** Localization strings */
  labels?: {
    selectAll?: string;
    deselectAll?: string;
    clear?: string;
    noOptions?: string;
    loading?: string;
    create?: string;
    selected?: string;
  };
}
