import { useState } from 'react';
import './Inputs.css';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  password?: boolean;
};

// Champs de texte
export function Input({ password, ...rest }: InputProps) {
  const [textVisible, setTextVisible] = useState(password === undefined);

  return (
    <div className="input-container">
      <input {...rest} type={password && !textVisible ? 'password' : 'text'} />
      {/* Le bouton pour cacher/afficher le mot de passe */}
      {password && (
        <div onClick={() => setTextVisible(!textVisible)}>
          {textVisible && <FaRegEyeSlash className="input-icon" />}
          {!textVisible && <FaRegEye className="input-icon" />}
        </div>
      )}
    </div>
  );
}
