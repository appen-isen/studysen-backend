import { FaExclamationTriangle } from 'react-icons/fa';
import './NotFound.css';
import { Link } from 'react-router';

export default function NotFound() {
  return (
    <div className="notfound-container">
      <FaExclamationTriangle className="notfound-icon" />
      <h1 className="notfound-title">404</h1>
      <h2 className="notfound-subtitle">Page introuvable</h2>
      <p className="notfound-text">Oups ! La page que vous cherchez n'existe pas ou a été déplacée.</p>
      <Link to="/" className="btn notfound-btn">
        Retour à l'accueil
      </Link>
    </div>
  );
}
