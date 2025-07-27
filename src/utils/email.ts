import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Logger from './logger';
import path from 'path';
import fs from 'fs';

const logger = new Logger('Mail');

let transporter: nodemailer.Transporter | null = null;

// Initialise le transporteur de mail
export function initializeMailer(): void {
  try {
    // Vérification des variables d'environnement
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      (!process.env.SMTP_PASSWORD && !process.env.FROM_MAIL)
    ) {
      logger.error("Configuration SMTP manquante dans les variables d'environnement");
      return;
    }
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    logger.info('Transporteur de mail initialisé avec succès');
  } catch (error) {
    logger.error("Erreur lors de l'initialisation du transporteur de mail:", error);
    throw error;
  }
}

// Vérifie la connexion SMTP
export async function verifyConnection(): Promise<boolean> {
  if (!transporter) {
    logger.error("Le transporteur de mail n'est pas initialisé");
    return false;
  }

  try {
    await transporter.verify();
    logger.info('Connexion SMTP vérifiée avec succès');
    return true;
  } catch (error) {
    logger.error('Erreur lors de la vérification de la connexion SMTP:', error);
    return false;
  }
}

// Envoie un email
export async function sendEmail(
  to: string,
  subject: string,
  templateName: string,
  variables: Record<string, any>
): Promise<void> {
  if (!transporter) {
    logger.error("Le transporteur de mail n'est pas initialisé");
    return;
  }

  const templatePath = path.join(__dirname, '../emails', `${templateName}.html`);
  let html = fs.readFileSync(templatePath, 'utf8');

  // Remplace les variables dans le template
  for (const [key, value] of Object.entries(variables)) {
    html = html.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
  }

  try {
    const mailOptions = {
      from: process.env.FROM_MAIL,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Email ${subject} envoyé avec succès à ${to}`);
  } catch (error) {
    logger.error("Erreur lors de l'envoi de l'email:", error);
  }
}
