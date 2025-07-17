import './Contact.css';
import { FaEnvelope, FaGithub } from 'react-icons/fa6';

function Contact() {
  return (
    <div className="main-container">
      <h1 className="title">Contact & Support</h1>

      <div className="contact-content">
        <p className="contact-description">
          Vous avez une question ou rencontrez un problème avec l'espace clubs ? Nous sommes là pour vous
          aider !
        </p>

        <div className="contact-options">
          <div className="contact-option">
            <div className="contact-icon">
              <FaEnvelope size={24} />
            </div>
            <div className="contact-info">
              <h3>Contact par email</h3>
              <p>Pour toute question générale ou assistance</p>
              <a href="mailto:contact@studysen.fr" className="contact-link">
                contact@studysen.fr
              </a>
            </div>
          </div>

          <div className="contact-option">
            <div className="contact-icon">
              <FaGithub size={24} />
            </div>
            <div className="contact-info">
              <h3>Signaler un bug</h3>
              <p>Vous avez trouvé un problème technique ?</p>
              <a
                href="https://github.com/appen-isen/studysen-backend/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                Créer une issue sur GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
