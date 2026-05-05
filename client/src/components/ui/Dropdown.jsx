import PropTypes from 'prop-types';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { List } from 'react-window';
import styles from './Dropdown.module.css';

const ROW_H = 44;

function DropdownRow({
  index,
  style,
  ariaAttributes,
  options,
  activeIndex,
  selectedSet,
  multi,
  onPick,
}) {
  const opt = options[index];
  if (!opt) return null;
  const selected = multi ? selectedSet.has(opt.value) : false;
  return (
    <div style={style} {...ariaAttributes}>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        className={`${styles.option} ${index === activeIndex ? styles.optionActive : ''} ${selected ? styles.optionSelected : ''}`}
        onClick={() => onPick(opt)}
      >
        {multi && <span className={styles.multiCheck}>{selected ? '✓' : ''}</span>}
        {opt.label}
      </button>
    </div>
  );
}

DropdownRow.propTypes = {
  index: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
  ariaAttributes: PropTypes.object,
  options: PropTypes.array.isRequired,
  activeIndex: PropTypes.number.isRequired,
  selectedSet: PropTypes.object.isRequired,
  multi: PropTypes.bool.isRequired,
  onPick: PropTypes.func.isRequired,
};

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchable = false,
  multi = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef(null);
  const id = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const selectedSet = useMemo(() => {
    if (!multi) return new Set();
    return new Set(Array.isArray(value) ? value : []);
  }, [multi, value]);

  const displayLabel = useMemo(() => {
    if (multi) {
      const n = Array.isArray(value) ? value.length : 0;
      return n ? `${n} selected` : placeholder;
    }
    const cur = options.find((o) => o.value === value);
    return cur?.label ?? placeholder;
  }, [multi, value, options, placeholder]);

  const onPick = useCallback(
    (opt) => {
      if (multi) {
        const cur = Array.isArray(value) ? [...value] : [];
        const i = cur.indexOf(opt.value);
        if (i >= 0) cur.splice(i, 1);
        else cur.push(opt.value);
        onChange(cur);
      } else {
        onChange(opt.value);
        setOpen(false);
        setQuery('');
      }
    },
    [multi, onChange, value]
  );

  useEffect(() => {
    if (!open) return undefined;
    function onDoc(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const onKeyDown = useCallback(
    (e) => {
      if (!open) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveIndex(0);
          setOpen(true);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        onPick(filtered[activeIndex]);
      }
    },
    [open, filtered, activeIndex, onPick]
  );

  const listHeight = Math.min(240, Math.max(ROW_H, filtered.length * ROW_H));
  const useVirtual = filtered.length > 100;

  const rowProps = useMemo(
    () => ({
      options: filtered,
      activeIndex,
      selectedSet,
      multi,
      onPick,
    }),
    [filtered, activeIndex, selectedSet, multi, onPick]
  );

  return (
    <div ref={wrapRef} className={styles.wrap} onKeyDown={onKeyDown}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        id={`${id}-trigger`}
        onClick={() => {
          setOpen((o) => {
            const next = !o;
            if (next) setActiveIndex(0);
            return next;
          });
        }}
      >
        <span className="truncate">{displayLabel}</span>
        <span aria-hidden>▾</span>
      </button>
      {open && (
        <div
          id={`${id}-listbox`}
          className={styles.panel}
          role="listbox"
          aria-labelledby={`${id}-trigger`}
          tabIndex={-1}
        >
          {searchable && (
            <div className={styles.search}>
              <input
                className={styles.searchInput}
                placeholder="Filter…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                aria-label="Filter options"
                autoFocus
              />
            </div>
          )}
          <div className={styles.list}>
            {useVirtual ? (
              <List
                rowCount={filtered.length}
                rowHeight={ROW_H}
                rowComponent={DropdownRow}
                rowProps={rowProps}
                style={{ height: listHeight, width: '100%' }}
              />
            ) : (
              filtered.map((opt, index) => (
                <DropdownRow
                  key={opt.value}
                  index={index}
                  style={{ height: ROW_H, width: '100%' }}
                  ariaAttributes={{
                    'aria-posinset': index + 1,
                    'aria-setsize': filtered.length,
                    role: 'listitem',
                  }}
                  {...rowProps}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.any.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  searchable: PropTypes.bool,
  multi: PropTypes.bool,
};
