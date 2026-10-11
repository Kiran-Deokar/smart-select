import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { SmartSelect } from './components/SmartSelect';
import type { Option } from './types';
import './styles.css';

/* ------------------------------------------------------------------ */
/*  Sample data                                                        */
/* ------------------------------------------------------------------ */

const FRUITS: Option[] = [
  { label: 'Apple', value: 'apple', icon: '🍎', description: 'Crisp & sweet' },
  { label: 'Banana', value: 'banana', icon: '🍌', description: 'Potassium rich' },
  { label: 'Cherry', value: 'cherry', icon: '🍒', description: 'Tiny & tart' },
  { label: 'Date', value: 'date', icon: '🌴', description: 'Naturally sweet' },
  { label: 'Elderberry', value: 'elderberry', icon: '🫐', description: 'Immune boost' },
  { label: 'Fig', value: 'fig', icon: '🪴', description: 'Soft & seedy' },
  { label: 'Grape', value: 'grape', icon: '🍇', description: 'Juicy clusters' },
  { label: 'Honeydew', value: 'honeydew', icon: '🍈', description: 'Mild melon' },
  { label: 'Kiwi', value: 'kiwi', icon: '🥝', description: 'Fuzzy & tangy', disabled: true },
  { label: 'Lemon', value: 'lemon', icon: '🍋', description: 'Sour citrus' },
];

const GROUPED: Option[] = [
  { label: 'React', value: 'react', group: 'Frontend', icon: '⚛️' },
  { label: 'Vue', value: 'vue', group: 'Frontend', icon: '💚' },
  { label: 'Angular', value: 'angular', group: 'Frontend', icon: '🅰️' },
  { label: 'Svelte', value: 'svelte', group: 'Frontend', icon: '🔥' },
  { label: 'Node.js', value: 'node', group: 'Backend', icon: '🟢' },
  { label: 'Django', value: 'django', group: 'Backend', icon: '🐍' },
  { label: 'Rails', value: 'rails', group: 'Backend', icon: '💎' },
  { label: 'Go', value: 'go', group: 'Backend', icon: '🔵' },
  { label: 'PostgreSQL', value: 'postgres', group: 'Database', icon: '🐘' },
  { label: 'MongoDB', value: 'mongo', group: 'Database', icon: '🍃' },
  { label: 'Redis', value: 'redis', group: 'Database', icon: '🔴' },
];

const COUNTRIES: Option[] = [
  { label: 'United States', value: 'us', icon: '🇺🇸' },
  { label: 'Canada', value: 'ca', icon: '🇨🇦' },
  { label: 'United Kingdom', value: 'uk', icon: '🇬🇧' },
  { label: 'Germany', value: 'de', icon: '🇩🇪' },
  { label: 'France', value: 'fr', icon: '🇫🇷' },
  { label: 'Japan', value: 'jp', icon: '🇯🇵' },
  { label: 'India', value: 'in', icon: '🇮🇳' },
  { label: 'Brazil', value: 'br', icon: '🇧🇷' },
  { label: 'Australia', value: 'au', icon: '🇦🇺' },
  { label: 'South Korea', value: 'kr', icon: '🇰🇷' },
];

const CITIES: Record<string, Option[]> = {
  us: [
    { label: 'New York', value: 'nyc' },
    { label: 'Los Angeles', value: 'la' },
    { label: 'Chicago', value: 'chi' },
    { label: 'Houston', value: 'hou' },
  ],
  ca: [
    { label: 'Toronto', value: 'tor' },
    { label: 'Vancouver', value: 'van' },
    { label: 'Montreal', value: 'mtl' },
  ],
  uk: [
    { label: 'London', value: 'lon' },
    { label: 'Manchester', value: 'man' },
    { label: 'Edinburgh', value: 'edi' },
  ],
  de: [
    { label: 'Berlin', value: 'ber' },
    { label: 'Munich', value: 'mun' },
    { label: 'Hamburg', value: 'ham' },
  ],
  in: [
    { label: 'Mumbai', value: 'mum' },
    { label: 'Delhi', value: 'del' },
    { label: 'Bangalore', value: 'blr' },
    { label: 'Hyderabad', value: 'hyd' },
  ],
};

const TREE: Option[] = [
  {
    label: 'Electronics',
    value: 'electronics',
    icon: '💻',
    children: [
      { label: 'Phones', value: 'phones', icon: '📱' },
      { label: 'Laptops', value: 'laptops', icon: '💻' },
      { label: 'Tablets', value: 'tablets', icon: '📲' },
    ],
  },
  {
    label: 'Clothing',
    value: 'clothing',
    icon: '👕',
    children: [
      { label: 'Men', value: 'men', icon: '👔' },
      { label: 'Women', value: 'women', icon: '👗' },
      { label: 'Kids', value: 'kids', icon: '🧒' },
    ],
  },
  {
    label: 'Home',
    value: 'home',
    icon: '🏠',
    children: [
      { label: 'Furniture', value: 'furniture', icon: '🛋️' },
      { label: 'Decor', value: 'decor', icon: '🖼️' },
    ],
  },
];

const MANY_OPTIONS: Option[] = Array.from({ length: 500 }, (_, i) => ({
  label: `Option ${i + 1}`,
  value: `opt-${i + 1}`,
  description: `Description for item #${i + 1}`,
}));

const NAV = [
  { id: 'install', label: 'Installation', icon: '↓' },
  { id: 'single', label: 'Single-select', icon: '○' },
  { id: 'multi', label: 'Multi + Chips', icon: '☰' },
  { id: 'count', label: 'Count + Tooltip', icon: '#' },
  { id: 'creatable', label: 'Creatable Tags', icon: '+' },
  { id: 'select-all', label: 'Select All', icon: '☑' },
  { id: 'grouped', label: 'Grouped', icon: '▤' },
  { id: 'checkbox', label: 'Checkboxes', icon: '☐' },
  { id: 'custom-render', label: 'Custom Render', icon: '✦' },
  { id: 'async', label: 'Async Search', icon: '⟳' },
  { id: 'infinite', label: 'Infinite Scroll', icon: '∞' },
  { id: 'dependent', label: 'Dependent', icon: '⇄' },
  { id: 'hierarchical', label: 'Hierarchical', icon: '🌳' },
  { id: 'filter-sort', label: 'Filter & Sort', icon: '⇅' },
  { id: 'limits', label: 'Option Limits', icon: '3' },
  { id: 'validation', label: 'Validation', icon: '!' },
  { id: 'disabled', label: 'Disabled', icon: '⊘' },
  { id: 'placement', label: 'Menu Placement', icon: '↕' },
  { id: 'theming', label: 'Theming', icon: '◐' },
  { id: 'i18n', label: 'Localization', icon: '文' },
  { id: 'a11y', label: 'Accessibility', icon: '♿' },
];

/* ------------------------------------------------------------------ */
/*  Code block with copy                                               */
/* ------------------------------------------------------------------ */

function CodeBlock({ code, title = 'Example' }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(true);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mt-5 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-mono text-[11px] uppercase tracking-wider">{title}</span>
        </button>
        <button
          type="button"
          onClick={copy}
          className={`
            text-[11px] font-medium px-2.5 py-1 rounded-md transition-all duration-200
            ${copied
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }
          `}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {open && (
        <pre className="text-[12px] leading-relaxed bg-slate-950 text-slate-100 p-4 overflow-x-auto max-h-72 font-mono">
          <code>{code.trim()}</code>
        </pre>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  UI primitives                                                      */
/* ------------------------------------------------------------------ */

function Section({
  id,
  title,
  description,
  children,
  badge,
  badgeColor = 'indigo',
  code,
  codeTitle,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  code?: string;
  codeTitle?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add('visible');
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const badgeCls: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
    emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-100 text-amber-700 ring-amber-200',
    rose: 'bg-rose-100 text-rose-700 ring-rose-200',
    sky: 'bg-sky-100 text-sky-700 ring-sky-200',
    violet: 'bg-violet-100 text-violet-700 ring-violet-200',
  };

  return (
    <section
      ref={ref}
      id={id}
      className="section-reveal demo-card bg-white rounded-2xl p-6 sm:p-7 shadow-sm scroll-mt-28"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              {title}
            </h2>
            {badge && (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${
                  badgeCls[badgeColor] ?? badgeCls.indigo
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Live preview label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Live preview
        </span>
      </div>

      <div className="relative">{children}</div>

      {code && <CodeBlock code={code} title={codeTitle ?? 'Code example'} />}
    </section>
  );
}

function ValuePreview({ value }: { value: unknown }) {
  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-slate-100">
      <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="ml-2 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
          current value
        </span>
      </div>
      <pre className="text-xs bg-slate-950 text-emerald-400 p-3 overflow-auto max-h-28 font-mono leading-relaxed">
        {JSON.stringify(value, null, 2) || 'null'}
      </pre>
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200
        ${
          active
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 scale-105'
            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
        }
      `}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Demo                                                               */
/* ------------------------------------------------------------------ */

function Demo() {
  const [activeId, setActiveId] = useState('install');
  const [view, setView] = useState<'demo' | 'guide'>('demo');

  const [single, setSingle] = useState<Option | null>(FRUITS[0]);
  const [multi, setMulti] = useState<Option[]>([FRUITS[1], FRUITS[2]]);
  const [multiCount, setMultiCount] = useState<Option[]>([]);
  const [creatable, setCreatable] = useState<Option[]>([]);
  const [creatableOpts, setCreatableOpts] = useState(FRUITS);
  const [grouped, setGrouped] = useState<Option[]>([]);
  const [checkbox, setCheckbox] = useState<Option[]>([]);
  const [limited, setLimited] = useState<Option[]>([]);
  const [filtered, setFiltered] = useState<Option | null>(null);
  const [filterMode, setFilterMode] = useState<'includes' | 'startsWith' | 'exact'>('includes');
  const [asyncVal, setAsyncVal] = useState<Option | null>(null);
  const [asyncOpts, setAsyncOpts] = useState<Option[]>([]);
  const [asyncLoading, setAsyncLoading] = useState(false);
  const [infVal, setInfVal] = useState<Option[]>([]);
  const [infCount, setInfCount] = useState(30);
  const infOpts = useMemo(() => MANY_OPTIONS.slice(0, infCount), [infCount]);
  const [country, setCountry] = useState<Option | null>(null);
  const [city, setCity] = useState<Option | null>(null);
  const cityOpts = country ? CITIES[String(country.value)] ?? [] : [];
  const [treeVal, setTreeVal] = useState<Option | null>(null);
  const flatTree = useMemo(() => {
    const out: Option[] = [];
    TREE.forEach((p) => {
      out.push({ ...p, group: 'Categories' });
      p.children?.forEach((c) =>
        out.push({ ...c, group: p.label, description: `Under ${p.label}` })
      );
    });
    return out;
  }, []);
  const [requiredVal, setRequiredVal] = useState<Option | null>(null);
  const [touched, setTouched] = useState(false);
  const requiredError = touched && !requiredVal ? 'This field is required' : undefined;
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const [lang, setLang] = useState<'en' | 'es' | 'hi'>('en');
  const [placement, setPlacement] = useState<'auto' | 'top' | 'bottom'>('auto');

  const i18n = {
    en: {
      selectAll: 'Select all',
      deselectAll: 'Deselect all',
      clear: 'Clear',
      noOptions: 'No options found',
      loading: 'Loading...',
      selected: 'selected',
      placeholder: 'Search...',
    },
    es: {
      selectAll: 'Seleccionar todo',
      deselectAll: 'Deseleccionar todo',
      clear: 'Borrar',
      noOptions: 'Sin opciones',
      loading: 'Cargando...',
      selected: 'seleccionados',
      placeholder: 'Buscar...',
    },
    hi: {
      selectAll: 'सभी चुनें',
      deselectAll: 'सभी हटाएँ',
      clear: 'साफ़ करें',
      noOptions: 'कोई विकल्प नहीं',
      loading: 'लोड हो रहा है...',
      selected: 'चयनित',
      placeholder: 'खोजें...',
    },
  }[lang];

  const handleAsyncInput = useCallback((q: string) => {
    if (!q.trim()) {
      setAsyncOpts([]);
      return;
    }
    setAsyncLoading(true);
    setTimeout(() => {
      setAsyncOpts(
        COUNTRIES.filter((c) =>
          c.label.toLowerCase().includes(q.toLowerCase())
        )
      );
      setAsyncLoading(false);
    }, 550);
  }, []);

  // Scroll-spy
  useEffect(() => {
    if (view !== 'demo') return;
    const ids = NAV.map((n) => n.id);
    const observers: IntersectionObserver[] = [];
    const visible = new Map<string, number>();

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRatio);
          } else {
            visible.delete(id);
          }
          let best = id;
          let bestR = 0;
          visible.forEach((r, k) => {
            if (r > bestR) {
              bestR = r;
              best = k;
            }
          });
          if (visible.size) setActiveId(best);
        },
        { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
      );
      io.observe(el);
      observers.push(io);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [view]);

  useEffect(() => {
    const link = document.querySelector(`[data-nav="${activeId}"]`);
    link?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeId]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== HERO ===== */}
      <header className="hero-mesh relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-20 w-96 h-96 bg-violet-600 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-20 sm:pt-20 sm:pb-28">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-200 text-xs font-medium mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              v2.1 · Guide + Live Demo · Portal menu
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.15]">
              React Smart Select
            </h1>
            <p className="mt-4 text-lg text-indigo-200/90 max-w-xl leading-relaxed">
              Interactive guide with live previews and copy-paste code for every feature.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setView('demo');
                  setTimeout(() => document.getElementById('install')?.scrollIntoView({ behavior: 'smooth' }), 50);
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg transition-all duration-200 ${
                  view === 'demo'
                    ? 'bg-white text-indigo-700 shadow-indigo-900/30'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/15'
                }`}
              >
                Live demo + code
              </button>
              <button
                type="button"
                onClick={() => setView('guide')}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  view === 'guide'
                    ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-900/30 font-semibold'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/15 backdrop-blur-sm'
                }`}
              >
                Quick-start guide
              </button>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-2 animate-in fade-in duration-500 delay-150">
            {[
              'Searchable',
              'Multi-select',
              'Creatable',
              'Async',
              'Grouped',
              'Portal menu',
              'Auto placement',
              'i18n + RTL',
              'ARIA',
              'Validation',
            ].map((t) => (
              <span
                key={t}
                className="px-3 py-1 text-xs font-medium rounded-full bg-white/10 text-indigo-100 border border-white/10 backdrop-blur-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" className="w-full h-8 sm:h-12 text-slate-50">
            <path
              fill="currentColor"
              d="M0 48h1440V0C1200 40 960 48 720 32 480 16 240 0 0 24v24z"
            />
          </svg>
        </div>
      </header>

      {/* ===== QUICK-START GUIDE VIEW ===== */}
      {view === 'guide' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
          <div className="demo-card bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Quick-start guide</h2>
            <p className="mt-2 text-slate-500 text-sm leading-relaxed">
              Get Smart Select running in your React app in a few minutes. For the full API, see{' '}
              <code className="code-chip">GUIDE.md</code> in the package.
            </p>

            <h3 className="mt-8 text-sm font-semibold text-slate-800 uppercase tracking-wider">
              1. Install / copy
            </h3>
            <CodeBlock
              title="bash"
              code={`# Copy component into your project
cp -r react-smart-select-v2/src/components ./src/components/smart-select
cp react-smart-select-v2/src/types.ts ./src/components/smart-select/

# Ensure Tailwind scans the files
# tailwind.config.js → content: ['./src/**/*.{js,ts,jsx,tsx}']`}
            />

            <h3 className="mt-8 text-sm font-semibold text-slate-800 uppercase tracking-wider">
              2. Import styles
            </h3>
            <CodeBlock
              title="main.tsx"
              code={`import './components/smart-select/styles.css';
// or copy the keyframes from styles.css into your global CSS`}
            />

            <h3 className="mt-8 text-sm font-semibold text-slate-800 uppercase tracking-wider">
              3. Minimal usage
            </h3>
            <CodeBlock
              title="FruitPicker.tsx"
              code={`import { useState } from 'react';
import { SmartSelect } from './components/smart-select/SmartSelect';
import type { Option } from './components/smart-select/types';

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
      menuPlacement="auto"
    />
  );
}`}
            />

            <h3 className="mt-8 text-sm font-semibold text-slate-800 uppercase tracking-wider">
              4. Multi-select + creatable
            </h3>
            <CodeBlock
              title="TagPicker.tsx"
              code={`const [tags, setTags] = useState<Option[]>([]);

<SmartSelect
  options={options}
  value={tags}
  onChange={(v) => setTags((v as Option[]) || [])}
  isMulti
  isCreatable
  multiDisplayMode="all"   // or "count"
  showCheckboxes
  showSelectAll
  maxSelections={10}
  menuPlacement="auto"
  placeholder="Add tags..."
  onCreateOption={(input) => {
    // persist new option
  }}
/>`}
            />

            <h3 className="mt-8 text-sm font-semibold text-slate-800 uppercase tracking-wider">
              5. Async search
            </h3>
            <CodeBlock
              title="AsyncSearch.tsx"
              code={`const [options, setOptions] = useState<Option[]>([]);
const [loading, setLoading] = useState(false);

async function onInputChange(q: string) {
  if (!q.trim()) { setOptions([]); return; }
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
/>`}
            />

            <div className="mt-10 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-sm text-indigo-800">
                <strong>Next:</strong> switch to the{' '}
                <button
                  type="button"
                  className="underline font-semibold hover:text-indigo-600"
                  onClick={() => setView('demo')}
                >
                  Live demo + code
                </button>{' '}
                tab to try every feature with interactive previews and copyable examples.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== DEMO VIEW ===== */}
      {view === 'demo' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-2 pb-20">
          <div className="flex gap-10">
            {/* Sidebar */}
            <aside className="hidden lg:block w-52 flex-shrink-0">
              <div className="sticky top-6">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
                  Features
                </p>
                <nav className="nav-scroll max-h-[calc(100vh-5rem)] overflow-y-auto space-y-0.5 pr-1">
                  {NAV.map((n) => (
                    <a
                      key={n.id}
                      href={`#${n.id}`}
                      data-nav={n.id}
                      className={`nav-item flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 ${
                        activeId === n.id
                          ? 'active'
                          : 'hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className="w-5 text-center text-xs opacity-60">
                        {n.icon}
                      </span>
                      <span className="truncate">{n.label}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <main className="flex-1 min-w-0 space-y-6">
              {/* Mobile nav */}
              <div className="lg:hidden overflow-x-auto pb-2 -mx-1 px-1">
                <div className="flex gap-1.5 min-w-max">
                  {NAV.map((n) => (
                    <a
                      key={n.id}
                      href={`#${n.id}`}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-all ${
                        activeId === n.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {n.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Install */}
              <Section
                id="install"
                title="Installation"
                description="Copy the component into your project and configure Tailwind."
                badge="Setup"
                codeTitle="install"
                code={`# 1. Install Node Modules
npm install selectify-kit

# 2. Import `}
              >
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600 space-y-2">
                  <p>
                    <strong className="text-slate-800">Peer deps:</strong> react ≥ 17, react-dom ≥ 17
                  </p>
                  <p>
                    <strong className="text-slate-800">Styling:</strong> Tailwind utilities + small keyframes CSS
                  </p>
                  <p>
                    <strong className="text-slate-800">Menu:</strong> Portaled to{' '}
                    <code className="code-chip">document.body</code> with max z-index — always on top
                  </p>
                </div>
              </Section>

              {/* Single */}
              <Section
                id="single"
                title="Single-select"
                description="Select only one option. Keyboard: ↑↓ Enter Escape."
                badge="Core"
                codeTitle="Single-select"
                code={`const [value, setValue] = useState<Option | null>(null);

<SmartSelect
  options={options}
  value={value}
  onChange={(v) => setValue(v as Option | null)}
  placeholder="Choose a fruit..."
  isClearable
  isSearchable
  menuPlacement="auto"
/>`}
              >
                <SmartSelect
                  options={FRUITS}
                  value={single}
                  onChange={(v) => setSingle(v as Option | null)}
                  placeholder="Choose a fruit..."
                  isClearable
                  isSearchable
                />
                <ValuePreview value={single} />
              </Section>

              {/* Multi */}
              <Section
                id="multi"
                title="Multi-select + Chips"
                description="Selected items appear as animated removable chips."
                badge="Core"
                codeTitle="Multi-select"
                code={`const [value, setValue] = useState<Option[]>([]);

<SmartSelect
  options={options}
  value={value}
  onChange={(v) => setValue((v as Option[]) || [])}
  isMulti
  multiDisplayMode="all"
  isClearable
  placeholder="Select fruits..."
  menuPlacement="auto"
/>`}
              >
                <SmartSelect
                  options={FRUITS}
                  value={multi}
                  onChange={(v) => setMulti((v as Option[]) || [])}
                  isMulti
                  multiDisplayMode="all"
                  isClearable
                  placeholder="Select fruits..."
                />
                <ValuePreview value={multi} />
              </Section>

              {/* Count */}
              <Section
                id="count"
                title="Count + Tooltip"
                description='Shows "N selected". Hover the badge for the full list.'
                badge="New"
                badgeColor="emerald"
                codeTitle="Count mode"
                code={`<SmartSelect
  options={options}
  value={value}
  onChange={setValue}
  isMulti
  multiDisplayMode="count"
  showSelectAll
  placeholder="Select fruits..."
/>`}
              >
                <SmartSelect
                  options={FRUITS}
                  value={multiCount}
                  onChange={(v) => setMultiCount((v as Option[]) || [])}
                  isMulti
                  multiDisplayMode="count"
                  showSelectAll
                  placeholder="Select fruits..."
                />
                <ValuePreview value={multiCount} />
              </Section>

              {/* Creatable */}
              <Section
                id="creatable"
                title="Creatable Tags"
                description="Type a new value and press Enter. No duplicates in the dropdown."
                badge="Fixed"
                badgeColor="amber"
                codeTitle="Creatable"
                code={`<SmartSelect
  options={options}
  value={value}
  onChange={setValue}
  isMulti
  isCreatable
  multiDisplayMode="all"
  formatCreateLabel={(input) => \`Create "\${input}"\`}
  onCreateOption={(input) => {
    setOptions((prev) => [...prev, { label: input, value: input }]);
  }}
  placeholder="Add or create tags..."
/>`}
              >
                <SmartSelect
                  options={creatableOpts}
                  value={creatable}
                  onChange={(v) => setCreatable((v as Option[]) || [])}
                  isMulti
                  isCreatable
                  multiDisplayMode="all"
                  placeholder="Add or create tags..."
                  onCreateOption={(input) => {
                    setCreatableOpts((prev) => {
                      if (
                        prev.some(
                          (o) =>
                            o.value === input ||
                            o.label.toLowerCase() === input.toLowerCase()
                        )
                      )
                        return prev;
                      return [
                        ...prev,
                        { label: input, value: input, icon: '✨' },
                      ];
                    });
                  }}
                />
                <ValuePreview value={creatable} />
              </Section>

              {/* Select all */}
              <Section
                id="select-all"
                title="Select all / Deselect all"
                description="Action bar at the top of the menu."
                codeTitle="Select all"
                code={`<SmartSelect
  isMulti
  showSelectAll
  multiDisplayMode="all"
  options={options}
  value={value}
  onChange={setValue}
/>`}
              >
                <SmartSelect
                  options={FRUITS}
                  value={multi}
                  onChange={(v) => setMulti((v as Option[]) || [])}
                  isMulti
                  showSelectAll
                  multiDisplayMode="all"
                  placeholder="Select fruits..."
                />
              </Section>

              {/* Grouped */}
              <Section
                id="grouped"
                title="Grouped options"
                description="Organize options with a group field. Sticky headers in the menu."
                codeTitle="Grouped"
                code={`const options = [
  { label: 'React', value: 'react', group: 'Frontend' },
  { label: 'Vue', value: 'vue', group: 'Frontend' },
  { label: 'Node', value: 'node', group: 'Backend' },
];

<SmartSelect options={options} isMulti showCheckboxes />`}
              >
                <SmartSelect
                  options={GROUPED}
                  value={grouped}
                  onChange={(v) => setGrouped((v as Option[]) || [])}
                  isMulti
                  showCheckboxes
                  multiDisplayMode="all"
                  placeholder="Pick technologies..."
                />
                <ValuePreview value={grouped} />
              </Section>

              {/* Checkboxes */}
              <Section
                id="checkbox"
                title="Checkbox options"
                description="Visual checkboxes beside each option."
                codeTitle="Checkboxes"
                code={`<SmartSelect
  isMulti
  showCheckboxes
  showSelectAll
  multiDisplayMode="count"
  options={options}
  value={value}
  onChange={setValue}
/>`}
              >
                <SmartSelect
                  options={FRUITS}
                  value={checkbox}
                  onChange={(v) => setCheckbox((v as Option[]) || [])}
                  isMulti
                  showCheckboxes
                  showSelectAll
                  multiDisplayMode="count"
                  placeholder="Select with checkboxes..."
                />
                <ValuePreview value={checkbox} />
              </Section>

              {/* Custom render */}
              <Section
                id="custom-render"
                title="Custom option rendering"
                description="Icons, descriptions, and formatOptionLabel."
                codeTitle="Custom render"
                code={`<SmartSelect
  options={options}
  value={value}
  onChange={setValue}
  formatOptionLabel={(opt, { context }) => (
    <div className="flex items-center gap-3">
      <span className="text-xl">{opt.icon}</span>
      <div>
        <div className="font-medium">{opt.label}</div>
        {context === 'menu' && opt.description && (
          <div className="text-xs text-gray-500">{opt.description}</div>
        )}
      </div>
    </div>
  )}
/>`}
              >
                <SmartSelect
                  options={FRUITS}
                  value={single}
                  onChange={(v) => setSingle(v as Option | null)}
                  placeholder="Pick a fruit..."
                  formatOptionLabel={(opt, { context }) => (
                    <div className="flex items-center gap-3">
                      <span className="text-xl leading-none">
                        {opt.icon as string}
                      </span>
                      <div>
                        <div className="font-medium">{opt.label}</div>
                        {context === 'menu' && opt.description && (
                          <div className="text-xs text-slate-500">
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                />
              </Section>

              {/* Async */}
              <Section
                id="async"
                title="Async search"
                description="Type to search. Simulated API delay + loading spinner."
                badge="Async"
                badgeColor="sky"
                codeTitle="Async search"
                code={`const [options, setOptions] = useState<Option[]>([]);
const [loading, setLoading] = useState(false);

async function onInputChange(q: string) {
  if (!q.trim()) { setOptions([]); return; }
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
  loadingMessage="Searching..."
  onInputChange={onInputChange}
  noOptionsMessage={(q) =>
    q ? \`No results for "\${q}"\` : 'Type to search'
  }
/>`}
              >
                <SmartSelect
                  options={asyncOpts}
                  value={asyncVal}
                  onChange={(v) => setAsyncVal(v as Option | null)}
                  isLoading={asyncLoading}
                  loadingMessage="Searching countries..."
                  onInputChange={handleAsyncInput}
                  placeholder="Search countries..."
                  noOptionsMessage={(q) =>
                    q
                      ? `No countries matching "${q}"`
                      : 'Start typing to search'
                  }
                  isClearable
                />
                <ValuePreview value={asyncVal} />
              </Section>

              {/* Infinite */}
              <Section
                id="infinite"
                title="Infinite scrolling"
                description="Scroll to the bottom to load more (500 total)."
                codeTitle="Infinite scroll"
                code={`const [page, setPage] = useState(1);
const [options, setOptions] = useState<Option[]>([]);

function loadMore() {
  // fetch next page and append
  setOptions((prev) => [...prev, ...nextPage]);
  setPage((p) => p + 1);
}

<SmartSelect
  options={options}
  value={value}
  onChange={setValue}
  isMulti
  onMenuScrollToBottom={loadMore}
/>`}
              >
                <SmartSelect
                  options={infOpts}
                  value={infVal}
                  onChange={(v) => setInfVal((v as Option[]) || [])}
                  isMulti
                  multiDisplayMode="count"
                  showCheckboxes
                  placeholder={`Showing ${infCount} of 500...`}
                  onMenuScrollToBottom={() => {
                    setInfCount((c) => Math.min(c + 30, 500));
                  }}
                  menuClassName="ss-menu"
                />
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300"
                      style={{ width: `${(infCount / 500) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium tabular-nums">
                    {infCount}/500
                  </span>
                </div>
              </Section>

              {/* Dependent */}
              <Section
                id="dependent"
                title="Dependent dropdowns"
                description="City options update based on the selected country."
                codeTitle="Dependent"
                code={`const [country, setCountry] = useState<Option | null>(null);
const [city, setCity] = useState<Option | null>(null);
const cityOptions = country
  ? CITIES[String(country.value)] ?? []
  : [];

<>
  <SmartSelect
    options={COUNTRIES}
    value={country}
    onChange={(v) => {
      setCountry(v as Option | null);
      setCity(null);
    }}
  />
  <SmartSelect
    options={cityOptions}
    value={city}
    onChange={(v) => setCity(v as Option | null)}
    isDisabled={!country}
    placeholder={country ? 'Select city' : 'Select country first'}
  />
</>`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Country
                    </label>
                    <SmartSelect
                      options={COUNTRIES}
                      value={country}
                      onChange={(v) => {
                        setCountry(v as Option | null);
                        setCity(null);
                      }}
                      placeholder="Select country..."
                      isClearable
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      City
                    </label>
                    <SmartSelect
                      options={cityOpts}
                      value={city}
                      onChange={(v) => setCity(v as Option | null)}
                      placeholder={
                        country ? 'Select city...' : 'Select a country first'
                      }
                      isDisabled={!country}
                      isClearable
                    />
                  </div>
                </div>
                <ValuePreview value={{ country, city }} />
              </Section>

              {/* Hierarchical */}
              <Section
                id="hierarchical"
                title="Hierarchical options"
                description="Tree-like options shown with parent groups."
                codeTitle="Hierarchical"
                code={`// Flatten tree with group = parent label
const flat = categories.flatMap((cat) => [
  { ...cat, group: 'Categories' },
  ...(cat.children ?? []).map((c) => ({
    ...c,
    group: cat.label,
  })),
]);

<SmartSelect options={flat} value={value} onChange={setValue} />`}
              >
                <SmartSelect
                  options={flatTree}
                  value={treeVal}
                  onChange={(v) => setTreeVal(v as Option | null)}
                  placeholder="Browse categories..."
                  isClearable
                />
                <ValuePreview value={treeVal} />
              </Section>

              {/* Filter & Sort */}
              <Section
                id="filter-sort"
                title="Custom filtering & Sorting"
                description="Switch filter mode and sort order in real time."
                codeTitle="Filter & sort"
                code={`<SmartSelect
  options={options}
  value={value}
  onChange={setValue}
  filterMode="includes"  // 'includes' | 'startsWith' | 'exact'
  sortMode="asc"         // 'none' | 'asc' | 'desc'
  // or fully custom:
  // filterOption={(opt, q) => ...}
  // sortFn={(a, b) => ...}
/>`}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {(['includes', 'startsWith', 'exact'] as const).map((m) => (
                    <Pill
                      key={m}
                      active={filterMode === m}
                      onClick={() => setFilterMode(m)}
                    >
                      {m}
                    </Pill>
                  ))}
                </div>
                <SmartSelect
                  options={FRUITS}
                  value={filtered}
                  onChange={(v) => setFiltered(v as Option | null)}
                  filterMode={filterMode}
                  sortMode="asc"
                  placeholder={`Filter: ${filterMode} · sorted A→Z`}
                  isClearable
                />
              </Section>

              {/* Limits */}
              <Section
                id="limits"
                title="Option limits"
                description="Maximum of 3 selections allowed."
                codeTitle="maxSelections"
                code={`<SmartSelect
  isMulti
  maxSelections={3}
  showCheckboxes
  options={options}
  value={value}
  onChange={setValue}
/>`}
              >
                <SmartSelect
                  options={FRUITS}
                  value={limited}
                  onChange={(v) => setLimited((v as Option[]) || [])}
                  isMulti
                  maxSelections={3}
                  showCheckboxes
                  multiDisplayMode="all"
                  placeholder="Pick up to 3..."
                />
                <div className="mt-3 flex items-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-8 h-1.5 rounded-full transition-colors duration-200 ${
                        i < limited.length ? 'bg-indigo-500' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-slate-500 ml-1">
                    {limited.length}/3
                  </span>
                </div>
              </Section>

              {/* Validation */}
              <Section
                id="validation"
                title="Form validation"
                description="Required field with animated error and aria-invalid."
                badge="Form"
                badgeColor="rose"
                codeTitle="Validation"
                code={`const [value, setValue] = useState<Option | null>(null);
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
  error={error}
/>`}
              >
                <SmartSelect
                  options={FRUITS}
                  value={requiredVal}
                  onChange={(v) => {
                    setRequiredVal(v as Option | null);
                    setTouched(true);
                  }}
                  onMenuClose={() => setTouched(true)}
                  required
                  error={requiredError}
                  placeholder="Required selection..."
                  isClearable
                />
                <button
                  type="button"
                  className="mt-4 px-5 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                  onClick={() => setTouched(true)}
                >
                  Validate
                </button>
              </Section>

              {/* Disabled */}
              <Section
                id="disabled"
                title="Disabled options & control"
                description="Kiwi is disabled. The whole control can also be disabled."
                codeTitle="Disabled"
                code={`const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Kiwi', value: 'kiwi', disabled: true },
];

<SmartSelect options={options} value={value} onChange={setValue} />
<SmartSelect options={options} value={value} isDisabled />`}
              >
                <div className="space-y-4">
                  <SmartSelect
                    options={FRUITS}
                    value={single}
                    onChange={(v) => setSingle(v as Option | null)}
                    placeholder="Try selecting Kiwi..."
                  />
                  <SmartSelect
                    options={FRUITS}
                    value={FRUITS[0]}
                    isDisabled
                    placeholder="Disabled control"
                  />
                </div>
              </Section>

              {/* Placement */}
              <Section
                id="placement"
                title="Menu placement"
                description="Portal menu with auto flip. Always on top of other elements."
                badge="Portal"
                badgeColor="violet"
                codeTitle="Menu placement"
                code={`// auto (default) — flips to top when space below is tight
<SmartSelect menuPlacement="auto" />

// force direction
<SmartSelect menuPlacement="top" />
<SmartSelect menuPlacement="bottom" />

// custom width
<SmartSelect menuWidth={320} />
<SmartSelect menuWidth="20rem" />

// Menu is portaled to document.body with z-index: 2147483647`}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {(['auto', 'top', 'bottom'] as const).map((p) => (
                    <Pill
                      key={p}
                      active={placement === p}
                      onClick={() => setPlacement(p)}
                    >
                      {p}
                    </Pill>
                  ))}
                </div>
                <SmartSelect
                  options={FRUITS}
                  value={single}
                  onChange={(v) => setSingle(v as Option | null)}
                  menuPlacement={placement}
                  placeholder={`Placement: ${placement}`}
                  isClearable
                />
                <p className="mt-3 text-xs text-slate-500">
                  Open the menu near the bottom of the viewport with{' '}
                  <code className="code-chip">auto</code> to see it flip upward.
                </p>
              </Section>

              {/* Theming */}
              <Section
                id="theming"
                title="Theming & sizes"
                description="Size variants and custom class names."
                codeTitle="Theming"
                code={`<SmartSelect size="sm" />  // 'sm' | 'md' | 'lg'

<SmartSelect
  size="md"
  controlClassName="!border-indigo-300 focus-within:!ring-indigo-100"
  menuClassName="!rounded-xl"
/>`}
              >
                <div className="flex gap-2 mb-4">
                  {(['sm', 'md', 'lg'] as const).map((s) => (
                    <Pill key={s} active={size === s} onClick={() => setSize(s)}>
                      {s}
                    </Pill>
                  ))}
                </div>
                <SmartSelect
                  options={FRUITS}
                  value={single}
                  onChange={(v) => setSingle(v as Option | null)}
                  size={size}
                  placeholder={`Size: ${size}`}
                  controlClassName="!border-indigo-300 focus-within:!border-indigo-500 focus-within:!ring-indigo-100"
                />
              </Section>

              {/* i18n */}
              <Section
                id="i18n"
                title="Localization & RTL"
                description="Switch language and text direction."
                codeTitle="i18n + RTL"
                code={`<SmartSelect
  dir="rtl"
  labels={{
    selectAll: 'Seleccionar todo',
    deselectAll: 'Deseleccionar todo',
    clear: 'Borrar',
    noOptions: 'Sin opciones',
    loading: 'Cargando...',
    selected: 'seleccionados',
  }}
  placeholder="Buscar..."
  isMulti
  showSelectAll
/>`}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  {(['en', 'es', 'hi'] as const).map((l) => (
                    <Pill key={l} active={lang === l} onClick={() => setLang(l)}>
                      {l.toUpperCase()}
                    </Pill>
                  ))}
                  <Pill
                    active={dir === 'rtl'}
                    onClick={() =>
                      setDir((d) => (d === 'ltr' ? 'rtl' : 'ltr'))
                    }
                  >
                    RTL ({dir})
                  </Pill>
                </div>
                <SmartSelect
                  options={FRUITS}
                  value={multi}
                  onChange={(v) => setMulti((v as Option[]) || [])}
                  isMulti
                  showSelectAll
                  multiDisplayMode="count"
                  dir={dir}
                  labels={i18n}
                  placeholder={i18n.placeholder}
                />
              </Section>

              {/* A11y */}
              <Section
                id="a11y"
                title="Accessibility"
                description="ARIA roles, keyboard navigation, focus management."
                badge="a11y"
                badgeColor="emerald"
                codeTitle="Accessibility"
                code={`<SmartSelect
  id="fruit-select"
  aria-label="Choose a fruit"
  selectOnBlur
  options={options}
  value={value}
  onChange={setValue}
/>

// Built-in:
// role="combobox" / listbox / option
// aria-expanded, aria-selected, aria-disabled, aria-invalid
// ↑ ↓ Home End Enter Escape Tab Backspace`}
              >
                <SmartSelect
                  options={FRUITS}
                  value={single}
                  onChange={(v) => setSingle(v as Option | null)}
                  id="a11y-select"
                  aria-label="Accessible fruit selector"
                  placeholder="Fully keyboard accessible..."
                  selectOnBlur
                  isClearable
                />
                <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'role="combobox" / listbox / option',
                    'aria-expanded, aria-selected, aria-disabled',
                    'Arrow keys, Home / End, Enter, Escape',
                    'Focus management & label association',
                  ].map((t) => (
                    <li
                      key={t}
                      className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t}
                    </li>
                  ))}
                </ul>
              </Section>

              <footer className="text-center py-12">
                <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                  <span className="w-8 h-px bg-slate-200" />
                  React Smart Select v2
                  <span className="w-8 h-px bg-slate-200" />
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Live demo + code examples · See GUIDE.md for full docs
                </p>
              </footer>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Demo />);
