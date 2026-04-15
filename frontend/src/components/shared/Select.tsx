'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface SelectProps {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
}

export default function Select({
  label,
  error,
  options,
  placeholder = '— Pilih —',
  value,
  onChange,
  disabled,
  id,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = error ? `${selectId}-error` : undefined;
  const listboxId = `${selectId}-listbox`;

  const selectedOption = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Calculate menu position when opening
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  }, [isOpen]);

  // Scroll focused item into view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[focusedIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex, isOpen]);

  const handleSelect = useCallback(
    (val: string) => {
      onChange?.({ target: { value: val } });
      setIsOpen(false);
    },
    [onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          handleSelect(options[focusedIndex].value);
        } else {
          setIsOpen(!isOpen);
          setFocusedIndex(options.findIndex((o) => o.value === value));
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  const ChevronIcon = isOpen ? IconChevronUp : IconChevronDown;

  return (
    <div className="mb-3" ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="block text-label-md text-N-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          ref={triggerRef}
          id={selectId}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-activedescendant={isOpen && focusedIndex >= 0 ? `${selectId}-opt-${focusedIndex}` : undefined}
          aria-invalid={!!error}
          aria-describedby={errorId}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`w-full flex items-center justify-between px-3 py-3 text-body-md text-left
            bg-N-10 border rounded-md outline-none transition-colors duration-100
            ${error ? 'border-danger' : isOpen ? 'border-brand bg-white' : 'border-N-40'}
            ${disabled ? 'bg-N-20 text-N-300 cursor-not-allowed' : 'cursor-pointer hover:bg-N-20'}
            ${isOpen ? 'bg-white' : ''}`}
        >
          <span className={selectedOption ? 'text-N-800' : 'text-N-200'}>
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronIcon size={16} className="text-N-300 shrink-0 ml-2" stroke={2} />
        </button>

        {/* Menu (portaled to body to avoid overflow clipping) */}
        {isOpen && createPortal(
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, width: menuPos.width }}
            className="z-[9999] bg-white border border-N-40 rounded-md shadow-overlay max-h-[240px] overflow-y-auto py-1"
          >
            {options.length === 0 && (
              <li className="px-3 py-2 text-body-md text-N-200">Tidak ada opsi</li>
            )}
            {options.map((opt, i) => {
              const isSelected = opt.value === value;
              const isFocused = i === focusedIndex;
              return (
                <li
                  key={opt.value}
                  id={`${selectId}-opt-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setFocusedIndex(i)}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-3 py-2 text-body-md cursor-pointer transition-colors duration-75
                    ${isSelected ? 'bg-brand-subtle text-brand-boldest font-medium' : 'text-N-800'}
                    ${isFocused && !isSelected ? 'bg-N-20' : ''}
                  `}
                >
                  {opt.label}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
      </div>
      {error && (
        <p id={errorId} className="text-body-sm text-danger mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
