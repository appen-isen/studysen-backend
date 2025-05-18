import { useRef, useState, useEffect } from 'react';
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
    if (optionRefs.current[selectedIndex]) {
      const { offsetLeft, offsetWidth } = optionRefs.current[selectedIndex]!;
      setSliderStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [selectedIndex, options]);

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
