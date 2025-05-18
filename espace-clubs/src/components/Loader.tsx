import React from 'react';
import './Loader.css';

interface LoaderProps {
  size?: number; // taille en pixels
}

const Loader: React.FC<LoaderProps> = ({ size = 32 }) => {
  return <span className="loader-spinner" style={{ width: size, height: size }} aria-label="Chargement..." />;
};

export default Loader;
