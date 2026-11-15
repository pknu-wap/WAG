import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { ALL_CATEGORY } from '../../lib/category';

interface MultiSelectProps {
  options: string[];
  /** 선택된 항목. 비어 있으면 "전체" */
  value: string[];
  onChange: (next: string[]) => void;
  allLabel?: string;
  className?: string;
}

/** 카테고리 복수 선택 드롭다운. "전체" 를 고르면 나머지 선택이 풀립니다. */
const MultiSelect = ({ options, value, onChange, allLabel = ALL_CATEGORY, className }: MultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isAll = value.length === 0;
  const summary = isAll ? allLabel : value.join(', ');

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const toggle = (option: string) => {
    if (value.includes(option)) onChange(value.filter((v) => v !== option));
    else onChange([...value, option]);
  };

  return (
    <div ref={rootRef} className={classNames('relative text-black', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="relative w-full h-[34px] sm:h-[34px] bg-white border border-wag-line/60 rounded-[2px] text-sm font-medium px-8 truncate focus:outline-none focus-visible:ring-2 focus-visible:ring-light-btn"
      >
        {summary}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-wag-line">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <ul role="listbox" aria-multiselectable className="absolute left-0 right-0 top-full z-30 max-h-[165px] overflow-y-auto scrollbar-thin bg-white border border-wag-line shadow-soft">
          <li
            role="option"
            aria-selected={isAll}
            onClick={() => {
              onChange([]);
              setOpen(false);
            }}
            className="h-[33px] flex items-center justify-center bg-[#F3F8FC] border-b border-wag-line cursor-pointer text-base font-medium hover:bg-light-chat/40"
          >
            {allLabel}
          </li>
          {options.map((option) => {
            const checked = value.includes(option);
            return (
              <li
                key={option}
                role="option"
                aria-selected={checked}
                onClick={() => toggle(option)}
                className="relative h-[33px] flex items-center justify-center border-b border-wag-line last:border-b-0 cursor-pointer hover:bg-light-chat/40"
              >
                <span
                  className={classNames(
                    'absolute left-2 w-4 h-4 rounded-[2px] border border-wag-line flex items-center justify-center text-[10px] text-white',
                    checked ? 'bg-wag-checked' : 'bg-white'
                  )}
                  aria-hidden
                >
                  {checked ? '✓' : ''}
                </span>
                <span className={classNames('text-base', checked ? 'font-bold text-light-btn' : 'font-medium')}>{option}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MultiSelect;
