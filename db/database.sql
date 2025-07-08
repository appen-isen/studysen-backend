-- Création de la table des organisations
CREATE TABLE organizations (
    organization_id SERIAL PRIMARY KEY, -- Identifiant unique de l'organisation
    name VARCHAR(100) NOT NULL,         -- Nom de l'organisation
    description TEXT,                   -- Description de l'organisation
    campus VARCHAR(100) NOT NULL,       -- Campus de l'organisation
    image_url VARCHAR(255)              -- URL de l'image de l'organisation
);

-- Création de la table des événements
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,       -- Identifiant unique de l'événement
    title VARCHAR(100) NOT NULL,      -- Titre de l'événement
    description TEXT,                 -- Description de l'événement
    date TIMESTAMP NOT NULL,          -- Date et heure de l'événement
    location VARCHAR(255) NOT NULL,   -- Lieu de l'événement
    organizer_id INT NOT NULL ,   -- Organisateur de l'événement
    image_url VARCHAR(255),            -- URL de l'image de l'événement
    events_link VARCHAR(255),          -- URL d'incription à l'événement (si site externe type helloasso)
    FOREIGN KEY (organizer_id) REFERENCES organizations(organization_id) -- Clé étrangère vers la table organizations
);

-- Création de la table transversale entre les événements et les organisations
CREATE TABLE event_organizations (
    event_id INT NOT NULL,             -- Référence à l'événement
    organization_id INT NOT NULL,      -- Référence à l'organisation
    FOREIGN KEY (event_id) REFERENCES events(event_id), -- Clé étrangère vers la table events
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) -- Clé étrangère vers la table organizations
);

-- Création de la table des utilisateurs
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,        -- Identifiant unique de l'utilisateur
    email VARCHAR(255) NOT NULL,        -- Email de l'utilisateur
    password TEXT NOT NULL,             -- Mot de passe de l'utilisateur
    username VARCHAR(255) NOT NULL,     -- Nom d'utilisateur
    promo VARCHAR(255),                 -- Promotion de l'utilisateur
    campus VARCHAR(255),                -- Campus de l'utilisateur
    isenId VARCHAR(255)                -- Identifiant ISEN de l'utilisateur
);

-- Création de la table des participants
CREATE TABLE event_participants (
    user_id INT NOT NULL,       -- Email du participant
    event_id INT NOT NULL,             -- Référence à l'événement
    FOREIGN KEY (event_id) REFERENCES events(event_id), -- Clé étrangère vers la table events
    FOREIGN KEY (user_id) REFERENCES users(user_id) -- Clé étrangère vers la table users
);

-- Création de la table des permissions
CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,       -- Identifiant unique de la permission
    permission_name VARCHAR(50) NOT NULL    -- Nom de la permission
);

-- Création de la table des permissions des utilisateurs
CREATE TABLE user_permissions (
    user_id INT NOT NULL,              -- Référence à l'utilisateur
    permission_id INT NOT NULL,        -- Référence à la permission
    FOREIGN KEY (user_id) REFERENCES users(user_id), -- Clé étrangère vers la table users
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) -- Clé étrangère vers la table permissions
);

-- Création de la table des organisations des utilisateurs
CREATE TABLE user_organizations (
    user_id INT NOT NULL,              -- Référence à l'utilisateur
    organization_id INT NOT NULL,      -- Référence à l'organisation
    FOREIGN KEY (user_id) REFERENCES users(user_id), -- Clé étrangère vers la table users
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) -- Clé étrangère vers la table organizations
);

-- Création de la table des notifications
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY, -- Identifiant unique de la notification
    user_id INT NOT NULL,               -- Référence à l'utilisateur
    device_id TEXT NOT NULL,            -- Identifiant du périphérique
    title TEXT NOT NULL,                -- Titre de la notification
    message TEXT NOT NULL,              -- Message de la notification
    date TIMESTAMP NOT NULL,            -- Date de la notification
    FOREIGN KEY (user_id) REFERENCES users(user_id) -- Clé étrangère vers la table users
);

-- Création de la table des clubs
CREATE TABLE clubs (
    club_id SERIAL PRIMARY KEY,        -- Identifiant unique du club
    name VARCHAR(100) NOT NULL,        -- Nom du club
    password TEXT NOT NULL,            -- Mot de passe du club pour l'accès au mode éditeur
    campus_id INT NOT NULL,            -- Numéro du campus
    enabled BOOLEAN NOT NULL,          -- Indique si le club est actif et autorisé à poster
    image_url TEXT                     -- URL de l'image du club
);

-- Création de la table des posts des clubs
CREATE TABLE posts (
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