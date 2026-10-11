# React Smart Select v2 — Integration Guide

This guide walks you through installing, integrating, and using every major feature of **react-smart-select-v2**.

---

## Table of contents

1. [Installation](#1-installation)
2. [Basic usage](#2-basic-usage)
3. [Option shape](#3-option-shape)
4. [Single-select](#4-single-select)
5. [Multi-select & display modes](#5-multi-select--display-modes)
6. [Creatable tags](#6-creatable-tags)
7. [Search & filtering](#7-search--filtering)
8. [Select all / max selections](#8-select-all--max-selections)
9. [Checkboxes & custom rendering](#9-checkboxes--custom-rendering)
10. [Grouped & hierarchical options](#10-grouped--hierarchical-options)
11. [Async search](#11-async-search)
12. [Infinite scroll](#12-infinite-scroll)
13. [Dependent dropdowns](#13-dependent-dropdowns)
14. [Validation](#14-validation)
15. [Disabled state](#15-disabled-state)
16. [Menu placement](#16-menu-placement)
17. [Theming & sizes](#17-theming--sizes)
18. [Localization & RTL](#18-localization--rtl)
19. [Accessibility](#19-accessibility)
20. [Full props reference](#20-full-props-reference)
21. [TypeScript](#21-typescript)
22. [Troubleshooting](#22-troubleshooting)

---

## 1. Installation

### Copy into your project (recommended for this package)

```bash
# Copy the src folder into your app, e.g.:
cp -r react-smart-select-v2/src/components ./src/components/smart-select
cp react-smart-select-v2/src/types.ts ./src/components/smart-select/
```

### Or use as a local package

```bash
cd react-smart-select-v2
npm install
npm run build   # if you add a build step
```

**Peer dependencies:** `react` ≥ 17, `react-dom` ≥ 17.

**Styling:** The component uses Tailwind utility classes. Ensure Tailwind is configured to scan the component files:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    // if you keep the package elsewhere, add its path:
    './node_modules/react-smart-select-v2/src/**/*.{js,ts,jsx,tsx}',
  ],
  // ...
};
```

Import the small animation CSS once in your app entry (or copy the keyframes into your global CSS):

```ts
import './path/to/smart-select/styles.css';
```

---

## 2. Basic usage

```tsx
import { useState } from 'react';
import { SmartSelect } from './components/SmartSelect';
import type { Option } from './types';

const options: Option[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

export function FruitPicker() {
  const [value, setValue] = useState<Option | null>(null);

  return (
    <SmartSelect
      options={options}
      value={value}
      onChange={(v) => setValue(v as Option | null)}
      placeholder="Choose a fruit..."
      isClearable
    />
  );
}
```

---

## 3. Option shape

```ts
type Option = {
  label: string;           // displayed text
  value: string | number;  // unique identifier
  disabled?: boolean;      // cannot be selected
  group?: string;          // category for grouped menus
  icon?: string | ReactNode;
  description?: string;    // secondary text
  children?: Option[];     // for hierarchical data
  [key: string]: unknown;  // any extra fields
};
```

---

## 4. Single-select

Default mode. Only one option can be selected.

```tsx
<SmartSelect
  options={options}
  value={value}                    // Option | null
  onChange={(v) => setValue(v as Option | null)}
  placeholder="Select..."
  isClearable
  isSearchable                     // default true
/>
```

---

## 5. Multi-select & display modes

```tsx
const [value, setValue] = useState<Option[]>([]);

// Show every selection as a removable chip
<SmartSelect
  options={options}
  value={value}
  onChange={(v) => setValue((v as Option[]) || [])}
  isMulti
  multiDisplayMode="all"           // default
/>

// Compact "N selected" badge — hover for tooltip list
<SmartSelect
  isMulti
  multiDisplayMode="count"
  ...
/>

// Chips until limit, then switch to count automatically
<SmartSelect
  isMulti
  multiDisplayMode="all"
  maxChipsToShow={3}
  ...
/>
```

---

## 6. Creatable tags

Allow users to add options that are not in the list. Duplicates (by value **or** label) are never offered twice.

```tsx
<SmartSelect
  options={options}
  value={value}
  onChange={setValue}
  isMulti
  isCreatable
  formatCreateLabel={(input) => `Add "${input}"`}
  onCreateOption={(input) => {
    // Persist the new option in your state / backend
    setOptions((prev) => [...prev, { label: input, value: input }]);
  }}
/>
```

---

## 7. Search & filtering

Search is on by default (`isSearchable={true}`).

```tsx
// Built-in modes
<SmartSelect filterMode="includes" />     // default — substring match
<SmartSelect filterMode="startsWith" />
<SmartSelect filterMode="exact" />

// Fully custom
<SmartSelect
  filterOption={(option, input) =>
    option.label.toLowerCase().includes(input.toLowerCase()) ||
    String(option.value).includes(input)
  }
/>

// Sort
<SmartSelect sortMode="asc" />   // 'none' | 'asc' | 'desc'
<SmartSelect sortFn={(a, b) => a.label.localeCompare(b.label)} />
```

---

## 8. Select all / max selections

```tsx
<SmartSelect
  isMulti
  showSelectAll          // adds "Select all" / "Deselect all" bar
  maxSelections={5}      // hard limit
  ...
/>
```

---

## 9. Checkboxes & custom rendering

```tsx
// Checkboxes next to each option
<SmartSelect isMulti showCheckboxes />

// Fully custom option UI
<SmartSelect
  formatOptionLabel={(opt, { context, isSelected }) => (
    <div className="flex items-center gap-2">
      <img src={opt.icon as string} className="w-5 h-5 rounded-full" />
      <div>
        <div className="font-medium">{opt.label}</div>
        {context === 'menu' && (
          <div className="text-xs text-gray-500">{opt.description}</div>
        )}
      </div>
    </div>
  )}
/>
```

---

## 10. Grouped & hierarchical options

```tsx
const options = [
  { label: 'React', value: 'react', group: 'Frontend' },
  { label: 'Vue', value: 'vue', group: 'Frontend' },
  { label: 'Node', value: 'node', group: 'Backend' },
];

<SmartSelect options={options} isMulti />

// Hierarchical — flatten children with group = parent label
const flat = categories.flatMap((cat) => [
  { ...cat, group: 'Categories' },
  ...(cat.children ?? []).map((c) => ({ ...c, group: cat.label })),
]);
```

---

## 11. Async search

```tsx
const [options, setOptions] = useState<Option[]>([]);
const [loading, setLoading] = useState(false);

async function handleInput(q: string) {
  if (!q.trim()) {
    setOptions([]);
    return;
  }
  setLoading(true);
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  const data = await res.json();
  setOptions(data); // [{ label, value }, ...]
  setLoading(false);
}

<SmartSelect
  options={options}
  value={value}
  onChange={setValue}
  isLoading={loading}
  loadingMessage="Searching..."
  onInputChange={handleInput}
  noOptionsMessage={(q) =>
    q ? `No results for "${q}"` : 'Type to search'
  }
/>
```

---

## 12. Infinite scroll

```tsx
const [page, setPage] = useState(1);
const [options, setOptions] = useState<Option[]>([]);

async function loadMore() {
  const next = await fetchPage(page + 1);
  setOptions((prev) => [...prev, ...next]);
  setPage((p) => p + 1);
}

<SmartSelect
  options={options}
  onMenuScrollToBottom={loadMore}
  isMulti
/>
```

---

## 13. Dependent dropdowns

```tsx
const [country, setCountry] = useState<Option | null>(null);
const [city, setCity] = useState<Option | null>(null);

const cityOptions = country
  ? CITIES_BY_COUNTRY[String(country.value)] ?? []
  : [];

<>
  <SmartSelect
    options={COUNTRIES}
    value={country}
    onChange={(v) => {
      setCountry(v as Option | null);
      setCity(null); // reset dependent
    }}
  />
  <SmartSelect
    options={cityOptions}
    value={city}
    onChange={(v) => setCity(v as Option | null)}
    isDisabled={!country}
    placeholder={country ? 'Select city' : 'Select country first'}
  />
</>
```

---

## 14. Validation

```tsx
const [value, setValue] = useState<Option | null>(null);
const [touched, setTouched] = useState(false);
const error = touched && !value ? 'This field is required' : undefined;

<SmartSelect
  options={options}
  value={value}
  onChange={(v) => {
    setValue(v as Option | null);
    setTouched(true);
  }}
  onMenuClose={() => setTouched(true)}
  required
  error={error}          // string message or boolean
/>
```

---

## 15. Disabled state

```tsx
// Disable individual options
const options = [
  { label: 'Active', value: 1 },
  { label: 'Unavailable', value: 2, disabled: true },
];

// Disable the whole control
<SmartSelect isDisabled options={options} value={value} />
```

---

## 16. Menu placement

The menu is rendered in a **React portal** attached to `document.body`, with `z-index: 2147483647`, so it always appears above other UI.

```tsx
// Auto (default) — opens below; flips above when space is tight
<SmartSelect menuPlacement="auto" />

// Force direction
<SmartSelect menuPlacement="top" />
<SmartSelect menuPlacement="bottom" />

// Custom width
<SmartSelect menuWidth={320} />
<SmartSelect menuWidth="20rem" />
```

Position is recalculated on scroll and resize.

---

## 17. Theming & sizes

```tsx
<SmartSelect size="sm" />   // 'sm' | 'md' | 'lg'

// Custom classes
<SmartSelect
  className="my-4"
  controlClassName="!border-indigo-400 focus-within:!ring-indigo-200"
  menuClassName="!rounded-xl"
/>
```

Override Tailwind classes with your design tokens as needed.

---

## 18. Localization & RTL

```tsx
<SmartSelect
  dir="rtl"                    // or "ltr"
  labels={{
    selectAll: 'Seleccionar todo',
    deselectAll: 'Deseleccionar todo',
    clear: 'Borrar',
    noOptions: 'Sin opciones',
    loading: 'Cargando...',
    selected: 'seleccionados',
  }}
  placeholder="Buscar..."
/>
```

---

## 19. Accessibility

Built-in support:

| Feature | Implementation |
|---------|----------------|
| Roles | `combobox`, `listbox`, `option` |
| State | `aria-expanded`, `aria-selected`, `aria-disabled`, `aria-invalid`, `aria-required` |
| Keyboard | ↑ ↓ Home End Enter Escape Tab Backspace |
| Labels | `aria-label`, `id` association |
| Focus | Focus returns to control on close |

```tsx
<SmartSelect
  id="fruit-select"
  aria-label="Choose a fruit"
  selectOnBlur          // select highlighted option on Tab
/>
```

---

## 20. Full props reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `Option[]` | required | Available options |
| `value` | `Option \| Option[] \| null` | — | Controlled value |
| `onChange` | `(value) => void` | — | Change handler |
| `placeholder` | `string` | `'Select...'` | Placeholder text |
| `isMulti` | `boolean` | `false` | Multi-select mode |
| `isCreatable` | `boolean` | `false` | Allow creating options |
| `multiDisplayMode` | `'all' \| 'count'` | `'all'` | Chip vs count display |
| `maxChipsToShow` | `number` | — | Auto-switch to count |
| `isDisabled` | `boolean` | `false` | Disable control |
| `isClearable` | `boolean` | `true` | Show clear button |
| `isSearchable` | `boolean` | `true` | Enable search input |
| `showCheckboxes` | `boolean` | `false` | Checkboxes in menu |
| `showSelectAll` | `boolean` | `false` | Select/Deselect all bar |
| `maxSelections` | `number` | — | Max multi selections |
| `isLoading` | `boolean` | `false` | Loading spinner |
| `loadingMessage` | `string` | — | Loading text |
| `noOptionsMessage` | `string \| fn` | `'No options'` | Empty state |
| `filterMode` | `FilterMode` | `'includes'` | Filter strategy |
| `filterOption` | `fn` | — | Custom filter |
| `sortMode` | `SortMode` | `'none'` | Sort strategy |
| `sortFn` | `fn` | — | Custom sort |
| `selectOnBlur` | `boolean` | `false` | Select on Tab/blur |
| `closeMenuOnSelect` | `boolean` | multi: false | Close after select |
| `hideSelectedOptions` | `boolean` | `true` | Hide selected in multi |
| `menuPlacement` | `'auto' \| 'top' \| 'bottom'` | `'auto'` | Menu direction |
| `menuWidth` | `string \| number` | control width | Menu width |
| `formatOptionLabel` | `fn` | — | Custom option UI |
| `formatGroupLabel` | `fn` | — | Custom group header |
| `formatCreateLabel` | `fn` | `` `Create "${input}"` `` | Create label |
| `onCreateOption` | `fn` | — | New option callback |
| `onInputChange` | `fn` | — | Input change (async) |
| `onMenuOpen` | `fn` | — | Menu opened |
| `onMenuClose` | `fn` | — | Menu closed |
| `onMenuScrollToBottom` | `fn` | — | Infinite scroll |
| `error` | `string \| boolean` | — | Validation error |
| `required` | `boolean` | `false` | Required field |
| `id` | `string` | — | DOM id |
| `name` | `string` | — | Form name |
| `aria-label` | `string` | — | Accessible name |
| `className` | `string` | — | Root class |
| `controlClassName` | `string` | — | Control class |
| `menuClassName` | `string` | — | Menu class |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Control size |
| `dir` | `'ltr' \| 'rtl'` | `'ltr'` | Text direction |
| `labels` | `object` | — | i18n strings |

---

## 21. TypeScript

```ts
import type {
  Option,
  SmartSelectProps,
  MultiDisplayMode,
  FilterMode,
  SortMode,
  MenuPlacement,
  GroupedOption,
} from './types';
```

All props are fully typed. `onChange` receives `Option | Option[] | null` depending on `isMulti`.

---

## 22. Troubleshooting

### Dropdown appears behind other elements

**Fixed in v2.1.** The menu is portaled to `document.body` with maximum z-index. If you still see issues:

1. Ensure you are on the latest component code (portal-based).
2. Do not apply `transform` / `filter` / `will-change` on `body` in a way that creates a containing block for `position: fixed` (rare).
3. Avoid `overflow: hidden` on `html`/`body` if it clips fixed elements in your layout.

### Menu opens in the wrong direction

Set `menuPlacement="auto"` (default). It measures available space and flips automatically. Force with `"top"` or `"bottom"` if needed.

### Creatable shows duplicates

Ensure options have unique `value`s and that you update the `options` array in `onCreateOption` so the existence check can see the new item.

### Styles missing

Confirm Tailwind `content` paths include the component source, and that the animation CSS (or equivalent keyframes) is imported.

### Async options flicker

Keep previous options visible while loading:

```tsx
<SmartSelect options={options} isLoading={loading} />
// Don't clear options until new results arrive
```

---

## Quick recipe card

```tsx
import { SmartSelect } from './SmartSelect';
import type { Option } from './types';

function Example() {
  const [tags, setTags] = useState<Option[]>([]);

  return (
    <SmartSelect
      options={INITIAL}
      value={tags}
      onChange={(v) => setTags((v as Option[]) || [])}
      isMulti
      isCreatable
      showCheckboxes
      showSelectAll
      multiDisplayMode="all"
      maxSelections={10}
      menuPlacement="auto"
      placeholder="Add tags..."
      onCreateOption={(input) => {
        /* save to backend */
      }}
    />
  );
}
```

For a live interactive tour of every feature, run the demo:

```bash
npm install
npm run dev
```
