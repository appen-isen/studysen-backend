import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
  boolean,
  foreignKey,
  date,
  time
} from 'drizzle-orm/pg-core';

// Après avoir modifié  ce fichier, pensez à executer cette commande :
// npx drizzle-kit generate

// WARNING : npx drizzle-kit push sert a GENERER UNE NOUVELLE BASE DE DONNEES
//           DONC, A NE PAS FAIRE =)

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
  imageUrl: text('image_url'), // URL de l'image du club
  contactEmail: text('contact_email') // Email de contact
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

// NOTE : Modification du code original pour la partie covoiturage
// NOTE : Noter que "time" a été importé en plus, pour cette table

export const carpool = pgTable('carpool', {
    deviceId: text('device_id').primaryKey().notNull(), // Identifiant unique du périphérique
    firstName: varchar({ length: 255 }).notNull(), // Prénom du profil
    lastName: varchar({ length: 255 }).notNull(), // Nom de famille du profil
    isConductor: boolean().notNull(), // Indique si le profil est conducteur
    isPassenger: boolean().notNull(), // Indique si le profil est passager
    housing: varchar({ length: 255 }).notNull(), // Indique le logement ou arret de bus du passager
    contactEmail: varchar({ length: 255 }).notNull(), // Addresse email ISEN du profil
    discordId: varchar({ length: 255 }), // Identifiant discord du profil (optionnel)
    instagramId: varchar({ length: 255 }), // Identifiant Instagram du profil (optionnel)
    phoneNumber: varchar({ length: 255 }), // Numéro de téléphone du profil (optionnel)
    // spécifications de dates de départ et d'arrivée
    // NOTE :faudrait-il faire une nouvelle table pour ces dates? ça serait plus propre.
    mondayDeparture: time({withTimezone: true}),
    mondayReturn: time({withTimezone: true}),
    tuesdayDeparture: time({withTimezone: true}),
    tuesdayReturn: time({withTimezone: true}),
    wednesdayDeparture: time({withTimezone: true}),
    wednesdayReturn: time({withTimezone: true}),
    thursdayDeparture: time({withTimezone: true}),
    thursdayReturn: time({withTimezone: true}),
    fridayDeparture: time({withTimezone: true}),
    fridayReturn: time({withTimezone: true}),    
  });
