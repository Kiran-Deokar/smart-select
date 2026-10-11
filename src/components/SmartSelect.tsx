import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Option,
  SmartSelectProps,
  MultiDisplayMode,
  GroupedOption,
} from '../types';
import { Chip } from './Chip';
import { Tooltip } from './Tooltip';

const CREATE_VALUE_PREFIX = '__create__';
const MENU_MAX_HEIGHT = 256; // max-h-64 = 16rem = 256px
const MENU_GAP = 6;

function isOptionEqual(a: Option, b: Option) {
  return String(a.value) === String(b.value);
}

function optionExists(options: Option[], candidate: Option | string) {
  const val =
    typeof candidate === 'string' ? candidate : String(candidate.value);
  return options.some(
    (o) =>
      String(o.value) === val ||
      o.label.toLowerCase() === val.toLowerCase()
  );
}

function flattenOptions(opts: Option[]): Option[] {
  const result: Option[] = [];
  const walk = (list: Option[]) => {
    list.forEach((o) => {
      result.push(o);
      if (o.children?.length) walk(o.children);
    });
  };
  walk(opts);
  return result;
}

export const SmartSelect: React.FC<SmartSelectProps> = ({
  options: externalOptions,
  value,
  onChange,
  placeholder = 'Select...',
  isMulti = false,
  isCreatable = false,
  multiDisplayMode = 'all' as MultiDisplayMode,
  maxChipsToShow,
  isDisabled = false,
  isClearable = true,
  isSearchable = true,
  showCheckboxes = false,
  showSelectAll = false,
  maxSelections,
  isLoading = false,
  loadingMessage,
  noOptionsMessage,
  filterMode = 'includes',
  filterOption,
  sortMode = 'none',
  sortFn,
  selectOnBlur = false,
  closeMenuOnSelect,
  hideSelectedOptions = true,
  menuPlacement = 'auto',
  menuWidth,
  formatOptionLabel,
  formatGroupLabel,
  formatCreateLabel = (input) => `Create "${input}"`,
  onCreateOption,
  onInputChange,
  onMenuOpen,
  onMenuClose,
  onMenuScrollToBottom,
  error,
  required = false,
  id,
  name,
  'aria-label': ariaLabel,
  className = '',
  controlClassName = '',
  menuClassName = '',
  size = 'md',
  dir = 'ltr',
  labels = {},
}) => {
  const L = {
    selectAll: labels.selectAll ?? 'Select all',
    deselectAll: labels.deselectAll ?? 'Deselect all',
    clear: labels.clear ?? 'Clear',
    noOptions: labels.noOptions ?? 'No options',
    loading: labels.loading ?? 'Loading...',
    create: labels.create ?? 'Create',
    selected: labels.selected ?? 'selected',
    ...labels,
  };

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [internalOptions, setInternalOptions] =
    useState<Option[]>(externalOptions);
  /** Fixed-position styles for the portaled menu */
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    zIndex: 2147483647,
    visibility: 'hidden',
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const highlightedIndexRef = useRef(0);

  useEffect(() => {
    setInternalOptions(externalOptions);
  }, [externalOptions]);

  useEffect(() => {
    highlightedIndexRef.current = highlightedIndex;
  }, [highlightedIndex]);

  const selected: Option[] = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const selectedValuesSet = useMemo(
    () => new Set(selected.map((s) => String(s.value))),
    [selected]
  );

  const flatAll = useMemo(
    () => flattenOptions(internalOptions),
    [internalOptions]
  );

  const matchesFilter = useCallback(
    (opt: Option, q: string) => {
      if (filterOption) return filterOption(opt, q);
      const label = opt.label.toLowerCase();
      const query = q.toLowerCase();
      if (filterMode === 'startsWith') return label.startsWith(query);
      if (filterMode === 'exact') return label === query;
      const desc = (opt.description ?? '').toLowerCase();
      const val = String(opt.value).toLowerCase();
      return (
        label.includes(query) ||
        desc.includes(query) ||
        val.includes(query)
      );
    },
    [filterOption, filterMode]
  );

  const applySort = useCallback(
    (list: Option[]) => {
      if (sortMode === 'none') return list;
      if (sortFn) return [...list].sort(sortFn);
      if (sortMode === 'asc')
        return [...list].sort((a, b) => a.label.localeCompare(b.label));
      if (sortMode === 'desc')
        return [...list].sort((a, b) => b.label.localeCompare(a.label));
      return list;
    },
    [sortMode, sortFn]
  );

  const filteredFlat = useMemo(() => {
    const q = inputValue.trim();
    let list = flatAll.filter((opt) => {
      if (
        isMulti &&
        hideSelectedOptions &&
        selectedValuesSet.has(String(opt.value))
      )
        return false;
      if (q && !matchesFilter(opt, q)) return false;
      return true;
    });
    list = applySort(list);

    if (isCreatable && q) {
      const already = optionExists(flatAll, q);
      if (!already) {
        list = [
          ...list,
          {
            label: formatCreateLabel(q),
            value: `${CREATE_VALUE_PREFIX}${q}`,
            __isNew__: true,
          } as Option,
        ];
      }
    }
    return list;
  }, [
    flatAll,
    inputValue,
    isMulti,
    hideSelectedOptions,
    selectedValuesSet,
    matchesFilter,
    applySort,
    isCreatable,
    formatCreateLabel,
  ]);

  const groupedForRender: GroupedOption[] = useMemo(() => {
    const hasGroups = internalOptions.some((o) => o.group);
    if (!hasGroups) {
      return [{ label: '', options: filteredFlat }];
    }
    const map = new Map<string, Option[]>();
    filteredFlat.forEach((opt) => {
      if ((opt as any).__isNew__) {
        const key = '__create__';
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(opt);
        return;
      }
      const g = (opt.group as string) || 'Other';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(opt);
    });
    return Array.from(map.entries()).map(([label, options]) => ({
      label: label === '__create__' ? '' : label,
      options,
    }));
  }, [internalOptions, filteredFlat]);

  const renderFlat = useMemo(() => {
    return groupedForRender.flatMap((g) => g.options);
  }, [groupedForRender]);

  const shouldShowCount =
    isMulti &&
    (multiDisplayMode === 'count' ||
      (multiDisplayMode === 'all' &&
        maxChipsToShow !== undefined &&
        selected.length > maxChipsToShow));

  const openMenu = useCallback(() => {
    if (isDisabled) return;
    setIsOpen(true);
    setHighlightedIndex(0);
    onMenuOpen?.();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [isDisabled, onMenuOpen]);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setInputValue('');
    onMenuClose?.();
  }, [onMenuClose]);

  // Outside click (include portaled menu)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closeMenu]);

  /**
   * Position the menu with fixed coordinates relative to the viewport.
   * Uses a portal so no parent stacking context can cover it.
   * Auto-flips to top when there isn't enough space below.
   */
  const updateMenuPosition = useCallback(() => {
    if (!isOpen || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - MENU_GAP;
    const spaceAbove = rect.top - MENU_GAP;

    let placement: 'top' | 'bottom' = 'bottom';
    if (menuPlacement === 'top') {
      placement = 'top';
    } else if (menuPlacement === 'bottom') {
      placement = 'bottom';
    } else {
      // auto
      const needsFlip =
        spaceBelow < Math.min(MENU_MAX_HEIGHT, 180) &&
        spaceAbove > spaceBelow;
      placement = needsFlip ? 'top' : 'bottom';
    }

    const width =
      menuWidth !== undefined
        ? typeof menuWidth === 'number'
          ? menuWidth
          : undefined
        : rect.width;

    const maxH =
      placement === 'bottom'
        ? Math.min(MENU_MAX_HEIGHT, Math.max(120, spaceBelow))
        : Math.min(MENU_MAX_HEIGHT, Math.max(120, spaceAbove));

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 2147483647, // max 32-bit int — always on top
      left: rect.left,
      width: width ?? rect.width,
      maxHeight: maxH,
      visibility: 'visible',
    };

    if (placement === 'top') {
      style.bottom = window.innerHeight - rect.top + MENU_GAP;
      style.top = 'auto';
    } else {
      style.top = rect.bottom + MENU_GAP;
      style.bottom = 'auto';
    }

    if (typeof menuWidth === 'string') {
      style.width = menuWidth;
    }

    setMenuStyle(style);
  }, [isOpen, menuPlacement, menuWidth]);

  useEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();

    const onScrollOrResize = () => updateMenuPosition();
    // capture scroll on any scrollable ancestor + window
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [isOpen, updateMenuPosition, renderFlat.length, isLoading]);

  // Scroll highlighted into view
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;
    const el = menuRef.current.querySelector(
      `[data-idx="${highlightedIndex}"]`
    ) as HTMLElement | null;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, isOpen]);

  const emitChange = useCallback(
    (next: Option[]) => {
      if (!onChange) return;
      if (isMulti) onChange(next);
      else onChange(next[0] ?? null);
    },
    [onChange, isMulti]
  );

  const selectOption = useCallback(
    (opt: Option) => {
      if (opt.disabled) return;

      if ((opt as any).__isNew__) {
        const raw = inputValue.trim();
        if (!raw) return;
        if (optionExists(flatAll, raw)) {
          const existing = flatAll.find(
            (o) =>
              String(o.value) === raw ||
              o.label.toLowerCase() === raw.toLowerCase()
          );
          if (existing) {
            if (isMulti) {
              if (!selectedValuesSet.has(String(existing.value))) {
                if (
                  maxSelections !== undefined &&
                  selected.length >= maxSelections
                )
                  return;
                emitChange([...selected, existing]);
              }
            } else {
              emitChange([existing]);
              closeMenu();
            }
          }
          setInputValue('');
          return;
        }
        const newOpt: Option = { label: raw, value: raw };
        setInternalOptions((prev) => [...prev, newOpt]);
        onCreateOption?.(raw);
        if (isMulti) {
          if (maxSelections !== undefined && selected.length >= maxSelections)
            return;
          emitChange([...selected, newOpt]);
        } else {
          emitChange([newOpt]);
          closeMenu();
        }
        setInputValue('');
        return;
      }

      if (isMulti) {
        if (selectedValuesSet.has(String(opt.value))) {
          emitChange(selected.filter((s) => !isOptionEqual(s, opt)));
        } else {
          if (
            maxSelections !== undefined &&
            selected.length >= maxSelections
          )
            return;
          emitChange([...selected, opt]);
        }
        setInputValue('');
        const shouldClose =
          closeMenuOnSelect !== undefined ? closeMenuOnSelect : false;
        if (shouldClose) closeMenu();
      } else {
        emitChange([opt]);
        closeMenu();
        setInputValue('');
      }
    },
    [
      inputValue,
      flatAll,
      isMulti,
      selected,
      selectedValuesSet,
      emitChange,
      onCreateOption,
      maxSelections,
      closeMenuOnSelect,
      closeMenu,
    ]
  );

  const removeOption = useCallback(
    (opt: Option) => {
      emitChange(selected.filter((s) => !isOptionEqual(s, opt)));
    },
    [selected, emitChange]
  );

  const clearAll = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      emitChange([]);
      setInputValue('');
    },
    [emitChange]
  );

  const selectAll = useCallback(() => {
    const selectable = flatAll.filter((o) => !o.disabled);
    const limited =
      maxSelections !== undefined
        ? selectable.slice(0, maxSelections)
        : selectable;
    emitChange(limited);
  }, [flatAll, maxSelections, emitChange]);

  const deselectAll = useCallback(() => {
    emitChange([]);
  }, [emitChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) openMenu();
        else
          setHighlightedIndex((i) =>
            Math.min(i + 1, renderFlat.length - 1)
          );
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && renderFlat[highlightedIndex]) {
          selectOption(renderFlat[highlightedIndex]);
        } else if (isCreatable && inputValue.trim()) {
          selectOption({
            label: formatCreateLabel(inputValue.trim()),
            value: `${CREATE_VALUE_PREFIX}${inputValue.trim()}`,
            __isNew__: true,
          } as Option);
        }
        break;
      case 'Escape':
        closeMenu();
        break;
      case 'Backspace':
        if (!inputValue && isMulti && selected.length > 0) {
          removeOption(selected[selected.length - 1]);
        }
        break;
      case 'Tab':
        if (selectOnBlur && isOpen && renderFlat[highlightedIndex]) {
          selectOption(renderFlat[highlightedIndex]);
        } else {
          closeMenu();
        }
        break;
      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;
      case 'End':
        if (isOpen) {
          e.preventDefault();
          setHighlightedIndex(renderFlat.length - 1);
        }
        break;
      default:
        break;
    }
  };

  const handleMenuScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 40) {
      onMenuScrollToBottom?.();
    }
  };

  const sizeClasses = {
    sm: 'min-h-[34px] text-sm px-2.5 py-1',
    md: 'min-h-[42px] text-sm px-3 py-1.5',
    lg: 'min-h-[50px] text-base px-4 py-2',
  }[size];

  const hasError = Boolean(error);

  const tooltipContent = (
    <ul className="text-left space-y-0.5 max-h-40 overflow-auto">
      {selected.map((s) => (
        <li key={String(s.value)} className="truncate">
          • {s.label}
        </li>
      ))}
    </ul>
  );

  const renderOption = (
    opt: Option,
    _isHighlighted: boolean,
    isSelected: boolean
  ) => {
    if (formatOptionLabel) {
      return formatOptionLabel(opt, {
        context: 'menu',
        isSelected,
      });
    }
    return (
      <div className="flex items-center gap-2 min-w-0">
        {showCheckboxes && isMulti && !(opt as any).__isNew__ && (
          <span
            className={`
              flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center
              transition-colors duration-150
              ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 bg-white'
              }
            `}
          >
            {isSelected && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
        )}
        {opt.icon && (
          <span className="flex-shrink-0 text-base leading-none">
            {typeof opt.icon === 'string' ? opt.icon : opt.icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate">{opt.label}</div>
          {opt.description && (
            <div className="text-xs text-gray-500 truncate">
              {opt.description}
            </div>
          )}
        </div>
        {isSelected && !showCheckboxes && !(opt as any).__isNew__ && (
          <svg
            className="w-4 h-4 text-blue-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    );
  };

  let flatIdx = -1;

  const menuNode = isOpen
    ? createPortal(
        <ul
          ref={menuRef}
          id={`${id ?? 'ss'}-listbox`}
          role="listbox"
          aria-multiselectable={isMulti}
          style={menuStyle}
          onScroll={handleMenuScroll}
          className={`
            overflow-auto
            bg-white border border-gray-200 rounded-lg shadow-2xl
            py-1 focus:outline-none
            animate-in fade-in zoom-in-95 duration-150
            ${menuClassName}
          `}
        >
          {showSelectAll && isMulti && !isLoading && (
            <li className="px-2 py-1.5 border-b border-gray-100 flex gap-2 sticky top-0 bg-white z-10">
              <button
                type="button"
                className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectAll();
                }}
              >
                {L.selectAll}
              </button>
              <button
                type="button"
                className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                onMouseDown={(e) => {
                  e.preventDefault();
                  deselectAll();
                }}
              >
                {L.deselectAll}
              </button>
            </li>
          )}

          {isLoading ? (
            <li className="px-3 py-4 text-sm text-gray-500 flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 animate-spin text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {loadingMessage ?? L.loading}
            </li>
          ) : renderFlat.length === 0 ? (
            <li className="px-3 py-3 text-sm text-gray-500 text-center">
              {typeof noOptionsMessage === 'function'
                ? noOptionsMessage(inputValue)
                : noOptionsMessage ?? L.noOptions}
            </li>
          ) : (
            groupedForRender.map((group) => (
              <React.Fragment key={group.label || 'default'}>
                {group.label && (
                  <li className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50/95 backdrop-blur-sm">
                    {formatGroupLabel
                      ? formatGroupLabel(group)
                      : group.label}
                  </li>
                )}
                {group.options.map((opt) => {
                  flatIdx += 1;
                  const idx = flatIdx;
                  const isNew = !!(opt as any).__isNew__;
                  const isHighlighted = idx === highlightedIndex;
                  const isSelected = selectedValuesSet.has(
                    String(opt.value)
                  );
                  return (
                    <li
                      key={String(opt.value)}
                      role="option"
                      aria-selected={isSelected}
                      aria-disabled={opt.disabled}
                      data-idx={idx}
                      className={`
                        px-3 py-2 cursor-pointer
                        transition-colors duration-100
                        ${isHighlighted ? 'bg-blue-50 text-blue-900' : 'text-gray-800'}
                        ${opt.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-50'}
                        ${isNew ? 'italic text-blue-600' : ''}
                      `}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectOption(opt);
                      }}
                    >
                      {renderOption(opt, isHighlighted, isSelected)}
                    </li>
                  );
                })}
              </React.Fragment>
            ))
          )}
        </ul>,
        document.body
      )
    : null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      id={id}
      dir={dir}
    >
      {name && (
        <input
          type="hidden"
          name={name}
          value={
            isMulti
              ? selected.map((s) => s.value).join(',')
              : selected[0]?.value ?? ''
          }
        />
      )}

      <div
        className={`
          flex flex-wrap items-center gap-1.5
          bg-white border rounded-lg shadow-sm
          transition-all duration-200 ease-out
          ${sizeClasses}
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'}
          ${isDisabled ? 'bg-gray-50 cursor-not-allowed opacity-70' : 'cursor-pointer'}
          ${hasError ? 'border-red-500 ring-2 ring-red-100' : ''}
          ${controlClassName}
        `}
        onClick={openMenu}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? `${id ?? 'ss'}-listbox` : undefined}
        aria-label={ariaLabel}
        aria-required={required}
        aria-invalid={hasError}
      >
        {selected.length === 0 && !inputValue && (
          <span className="text-gray-400 select-none pointer-events-none">
            {placeholder}
          </span>
        )}

        {isMulti && selected.length > 0 && (
          <>
            {shouldShowCount ? (
              <Tooltip content={tooltipContent}>
                <span
                  className="
                    inline-flex items-center px-2.5 py-1 text-sm font-medium
                    bg-blue-50 text-blue-700 border border-blue-200 rounded-md
                    cursor-default select-none
                    animate-in fade-in zoom-in-95 duration-150
                  "
                >
                  {selected.length} {L.selected}
                </span>
              </Tooltip>
            ) : (
              selected.map((opt) => (
                <span
                  key={String(opt.value)}
                  className="animate-in fade-in zoom-in-95 duration-150"
                >
                  <Chip
                    label={opt.label}
                    onRemove={() => removeOption(opt)}
                    disabled={isDisabled}
                  />
                </span>
              ))
            )}
          </>
        )}

        {!isMulti && selected.length > 0 && !inputValue && (
          <span className="text-gray-900 truncate animate-in fade-in duration-150">
            {formatOptionLabel
              ? formatOptionLabel(selected[0], {
                  context: 'value',
                  isSelected: true,
                })
              : selected[0].label}
          </span>
        )}

        {(isSearchable || isCreatable) && (
          <input
            ref={inputRef}
            type="text"
            className="
              flex-1 min-w-[60px] bg-transparent border-none outline-none
              text-inherit placeholder-gray-400
              disabled:cursor-not-allowed
            "
            value={inputValue}
            onChange={(e) => {
              const v = e.target.value;
              setInputValue(v);
              onInputChange?.(v);
              if (!isOpen) openMenu();
              setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => !isDisabled && openMenu()}
            disabled={isDisabled}
            placeholder={
              selected.length === 0 ? '' : isMulti ? 'Add...' : ''
            }
            aria-autocomplete="list"
            aria-controls={
              isOpen ? `${id ?? 'ss'}-listbox` : undefined
            }
            autoComplete="off"
          />
        )}

        {isLoading && (
          <svg
            className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {isClearable && selected.length > 0 && !isDisabled && (
          <button
            type="button"
            onClick={clearAll}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            aria-label={L.clear}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {hasError && typeof error === 'string' && (
        <p className="mt-1 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}

      {menuNode}
    </div>
  );
};

export default SmartSelect;
