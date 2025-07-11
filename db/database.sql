-- Création de la table des notifications (pour envoyer des notifications à une date précise)
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY, -- Identifiant unique de la notification
    device_id TEXT NOT NULL,            -- Identifiant du périphérique
    title TEXT NOT NULL,                -- Titre de la notification
    message TEXT NOT NULL,              -- Message de la notification
    date TIMESTAMP NOT NULL             -- Date de la notification
);
-- Création de la table des appareils (pour les notifications)
CREATE TABLE IF NOT EXISTS devices (
    device_id TEXT PRIMARY KEY,              -- Identifiant unique du périphérique
    campus_id INT NOT NULL                    -- Numéro du campus
);

-- Création de la table des clubs
CREATE TABLE IF NOT EXISTS clubs (
    club_id SERIAL PRIMARY KEY,        -- Identifiant unique du club
    name VARCHAR(100) NOT NULL,        -- Nom du club
    password TEXT NOT NULL,            -- Mot de passe du club pour l'accès au mode éditeur
    campus_id INT NOT NULL,            -- Numéro du campus
    enabled BOOLEAN NOT NULL,          -- Indique si le club est actif et autorisé à poster
    image_url TEXT                     -- URL de l'image du club
);

-- Création de la table des posts des clubs
CREATE TABLE IF NOT EXISTS posts (
    post_id SERIAL PRIMARY KEY,       -- Identifiant unique du post
    title VARCHAR(255) NOT NULL,      -- Titre du post
    is_event BOOLEAN NOT NULL,        -- Indique si le post est un événement
    date DATE NOT NULL,               -- Date du post (sans l'heure)
    club_id INT NOT NULL ,            -- Propriétaire du post (club)
    description TEXT,                 -- Description du post
    location TEXT,                    -- Lieu de l'événement
    image_url TEXT,                   -- URL de l'image de l'événement
    link TEXT,                        -- URL d'incription à l'événement (si site externe type helloasso)
    start_time VARCHAR(10),           -- Heure de début de l'événement
    price TEXT,                       -- Prix de l'événement
    age_limit INT,                    -- Limite d'âge pour l'événement
    FOREIGN KEY (club_id) REFERENCES clubs(club_id) -- Clé étrangère vers la table clubs
);