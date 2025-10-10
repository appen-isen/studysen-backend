import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
  boolean,
  foreignKey,
  date
} from 'drizzle-orm/pg-core';

// Création de la table des notifications (pour envoyer des notifications à une date précise)
export const notifications = pgTable('notifications', {
  notificationId: serial('notification_id').primaryKey().notNull(), // Identifiant unique de la notification
  deviceId: text('device_id').notNull(), // Identifiant du périphérique
  title: text().notNull(), // Titre de la notification
  message: text().notNull(), // Message de la notification
  date: timestamp({ mode: 'string' }).notNull() // Date de la notification
});

// Création de la table des appareils (pour les notifications)
export const devices = pgTable('devices', {
  deviceId: text('device_id').primaryKey().notNull(), // Identifiant unique du périphérique
  campusId: integer('campus_id').notNull() // Numéro du campus
});

// Création de la table des clubs
// NOTE: la colonne contact_email est présente dans db/database.sql mais n'est pas déclarée ici.
//       Si vous souhaitez l'ajouter au schéma Drizzle, il faudra prévoir une migration DB correspondante.
export const clubs = pgTable('clubs', {
  clubId: serial('club_id').primaryKey().notNull(), // Identifiant unique du club
  name: varchar({ length: 100 }).notNull(), // Nom du club
  password: text().notNull(), // Mot de passe du club pour l'accès au mode éditeur
  campusId: integer('campus_id').notNull(), // Numéro du campus
  enabled: boolean().notNull(), // Indique si le club est actif et autorisé à poster
  imageUrl: text('image_url') // URL de l'image du club
});

export const posts = pgTable(
  'posts',
  {
    postId: serial('post_id').primaryKey().notNull(), // Identifiant unique du post
    title: varchar({ length: 255 }).notNull(), // Titre du post
    isEvent: boolean('is_event').notNull(), // Indique si le post est un événement
    date: date().notNull(), // Date du post (sans l'heure)
    clubId: integer('club_id').notNull(), // Propriétaire du post (club)
    description: text(), // Description du post
    location: text(), // Lieu de l'événement
    imageUrl: text('image_url'), // URL de l'image de l'événement
    link: text(), // URL d'incription à l'événement (si site externe type helloasso)
    startTime: varchar('start_time', { length: 10 }), // Heure de début de l'événement
    price: text(), // Prix de l'événement
    ageLimit: integer('age_limit') // Limite d'âge pour l'événement
  },
  (table) => [
    foreignKey({
      columns: [table.clubId],
      foreignColumns: [clubs.clubId],
      name: 'posts_club_id_fkey'
    })
  ]
);

// Création de la table des données de télémétrie
export const telemetry = pgTable('telemetry', {
  telemetryId: serial('telemetry_id').primaryKey().notNull(), // Identifiant unique de la télémétrie
  type: text().notNull(), // Type de télémétrie (par exemple, "unknownSubject", etc.)
  data: text().notNull() // Valeur de la télémétrie
});
