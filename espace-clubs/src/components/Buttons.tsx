import { useEffect, useRef, useState } from 'react';
import './Buttons.css';

type MultiToggleProps = {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export const MultiToggle: React.FC<MultiToggleProps> = ({ options, selectedIndex, onSelect }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const element = optionRefs.current[selectedIndex];
    if (element) {
      const { offsetLeft, offsetWidth } = element;
      setSliderStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [selectedIndex]);

  return (
    <div className="multi-toggle-container" ref={containerRef}>
      <div className="multi-toggle-slider" style={{ left: sliderStyle.left, width: sliderStyle.width }} />
      {options.map((option, index) => (
        <button
          key={index}
          ref={(el) => {
            optionRefs.current[index] = el;
          }}
          className="multi-toggle-option"
          onClick={() => onSelect(index)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
  id?: string;
  className?: string;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  indeterminate = false,
  id,
  className
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autoIdRef = useRef<string>(`cbx-${Math.random().toString(36).slice(2, 9)}`);
  const inputId = id ?? autoIdRef.current;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked, e);
  };

  return (
    <label
      className={[
        'checkbox',
        disabled ? 'is-disabled' : '',
        indeterminate ? 'is-indeterminate' : '',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
      htmlFor={inputId}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="checkbox"
        className="checkbox-input"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-checked={indeterminate ? 'mixed' : checked}
      />
      <span className="checkbox-box" aria-hidden="true">
        <svg className="checkbox-icon" viewBox="0 0 24 24" focusable="false">
          <path d="M4 12.5l5 5L20 7" />
        </svg>
      </span>
      {label ? <span className="checkbox-text">{label}</span> : null}
    </label>
  );
};
