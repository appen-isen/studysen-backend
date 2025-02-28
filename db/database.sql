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

-- Création de la table des postes
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,       -- Identifiant unique de l'événement
    title VARCHAR(100) NOT NULL,      -- Titre de l'événement
    description TEXT,                 -- Description de l'événement
    organizer_id INT NOT NULL ,   -- Organisateur de l'événement
    image_url VARCHAR(255),            -- URL de l'image de l'événement
    FOREIGN KEY (organizer_id) REFERENCES organizations(organization_id) -- Clé étrangère vers la table organizations
);

-- Création de la table transversale entre les postes et les organisations
CREATE TABLE post_organizations (
    post_id INT NOT NULL,             -- Référence au poste
    organization_id INT NOT NULL,     -- Référence à l'organisation
    FOREIGN KEY (post_id) REFERENCES posts(post_id), -- Clé étrangère vers la table posts
    FOREIGN KEY (organization_id) REFERENCES organizations(organization_id) -- Clé étrangère vers la table organizations
);

-- Création de la table des utilisateurs
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,        -- Identifiant unique de l'utilisateur
    email VARCHAR(100) NOT NULL        -- Email de l'utilisateur
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