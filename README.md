# React Smart Select

A flexible, accessible React select with **30+ features**.

[![npm version](https://img.shields.io/npm/v/selectify-kit.svg)](https://www.npmjs.com/package/selectify-kit)
[![license](https://img.shields.io/npm/l/selectify-kit.svg)](./LICENSE)

- Single & multi select, creatable tags (no duplicates)
- Multi display modes: chips **or** count + hover tooltip
- Select all / Deselect all, checkboxes, option limits
- Grouped & hierarchical options
- Custom option rendering (icons, descriptions)
- Async search, infinite scroll, loading / empty states
- Custom filtering & sorting
- Dependent dropdowns
- Form validation, disabled options, clear
- Keyboard navigation, full ARIA support
- Theming (sizes), localization & RTL
- **Portal-based menu** — always on top, auto top/bottom placement
- Animated open / select / chip transitions

---

## Install

```bash
npm install selectify-kit
# or
yarn add selectify-kit
# or
pnpm add selectify-kit
```

**Peer dependencies:** `react` ≥ 17, `react-dom` ≥ 17.

### Tailwind CSS

This package uses Tailwind utility classes. Add the package to your Tailwind `content` paths:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/selectify-kit/dist/**/*.{js,cjs}',
  ],
  // ...
};
```

Optional animation helpers:

```ts
import 'selectify-kit/styles.css';
```

---

## Quick start

```tsx
import { useState } from 'react';
import { SmartSelect } from 'selectify-kit';
import type { Option } from 'selectify-kit';
import 'selectify-kit/styles.css';

const options: Option[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
];

function Example() {
  const [value, setValue] = useState<Option[]>([]);

  return (
    <SmartSelect
      options={options}
      value={value}
      onChange={(v) => setValue(v as Option[])}
      isMulti
      multiDisplayMode="count"
      isCreatable
      menuPlacement="auto"
      placeholder="Select or create..."
    />
  );
}
```

### Local demo

```bash
npm install
npm run dev
```

Open the demo — every feature is interactive with animations and copyable code examples.

---

## Integration guide

See **[GUIDE.md](./GUIDE.md)** for full installation, usage examples, props reference, and troubleshooting.

See **[PUBLISH.md](./PUBLISH.md)** for publishing this package to npm.

---

## Key props

| Prop | Description |
| --- | --- |
| `isMulti` | Multi-select |
| `multiDisplayMode` | `'all'` (chips) or `'count'` (badge + tooltip) |
| `isCreatable` | Allow creating new options |
| `showCheckboxes` | Checkboxes beside options |
| `showSelectAll` | Select all / Deselect all bar |
| `maxSelections` | Limit number of selections |
| `isLoading` | Show loading spinner |
| `filterMode` | `'includes'` \| `'startsWith'` \| `'exact'` |
| `sortMode` | `'none'` \| `'asc'` \| `'desc'` |
| `formatOptionLabel` | Custom option renderer |
| `onInputChange` | For async search |
| `onMenuScrollToBottom` | Infinite scroll |
| `menuPlacement` | `'auto'` \| `'top'` \| `'bottom'` |
| `error` | Validation message |
| `size` | `'sm'` \| `'md'` \| `'lg'` |
| `dir` | `'ltr'` \| `'rtl'` |
| `labels` | i18n strings |

See `src/types.ts` and **GUIDE.md** for the complete API.

---

## Common patterns

### Multi-select with chips

```tsx
<SmartSelect
  options={options}
  value={value}
  onChange={(v) => setValue(v as Option[])}
  isMulti
  multiDisplayMode="all"
  isClearable
/>
```

### Count badge + tooltip

```tsx
<SmartSelect
  isMulti
  multiDisplayMode="count"
  showSelectAll
  options={options}
  value={value}
  onChange={setValue}
/>
```

### Creatable tags (no duplicates)

```tsx
<SmartSelect
  isMulti
  isCreatable
  options={options}
  value={value}
  onChange={setValue}
  onCreateOption={(input) => {
    // persist the new option
  }}
/>
```

### Async search

```tsx
const [options, setOptions] = useState<Option[]>([]);
const [loading, setLoading] = useState(false);

async function onInputChange(q: string) {
  if (!q.trim()) {
    setOptions([]);
    return;
  }
  setLoading(true);
  const res = await fetch('/api/search?q=' + encodeURIComponent(q));
  setOptions(await res.json());
  setLoading(false);
}

<SmartSelect
  options={options}
  value={value}
  onChange={setValue}
  isLoading={loading}
  onInputChange={onInputChange}
  placeholder="Search..."
  menuPlacement="auto"
/>
```

### Validation

```tsx
<SmartSelect
  options={options}
  value={value}
  onChange={setValue}
  required
  error={touched && !value ? 'This field is required' : undefined}
/>
```

---

## Dropdown always on top

The menu is rendered with `createPortal(..., document.body)` and `z-index: 2147483647`. It is never clipped by parent `overflow` or stacking contexts. Placement auto-flips to top when there is not enough space below (`menuPlacement="auto"`).

---

## License

MIT
