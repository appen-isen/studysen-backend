import type React from 'react';
import './Loader.css';

interface LoaderProps {
  size?: number; // taille en pixels
  color?: string; // couleur de la bordure
}

const Loader: React.FC<LoaderProps> = ({ size = 32, color = '#fa4747' }) => {
  return (
    <span
      className="loader-spinner"
      style={{
        width: size,
        height: size,
        alignSelf: 'center',
        border: `2px solid ${color}`,
        borderTop: '2px solid transparent'
      }}
      aria-label="Chargement..."
    />
  );
};

export default Loader;
