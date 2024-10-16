-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 16 oct. 2024 à 22:21
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `securbot`
--

-- --------------------------------------------------------

--
-- Structure de la table `antiraid`
--

CREATE TABLE `antiraid` (
  `guild_id` varchar(20) NOT NULL,
  `event` varchar(50) NOT NULL,
  `status` tinyint(1) DEFAULT 0,
  `whitelist` tinyint(1) DEFAULT 0,
  `sanction` enum('kick','ban','derank') DEFAULT 'kick'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `antiraid`
--

INSERT INTO `antiraid` (`guild_id`, `event`, `status`, `whitelist`, `sanction`) VALUES
('659747468107317249', 'ban', 0, 1, 'ban'),
('659747468107317249', 'bot', 0, 1, 'ban'),
('659747468107317249', 'channelcreate', 0, 1, 'ban'),
('659747468107317249', 'channeldelete', 0, 1, 'ban'),
('659747468107317249', 'channeledit', 0, 1, 'ban'),
('659747468107317249', 'deco', 0, 1, 'ban'),
('659747468107317249', 'mute', 0, 1, 'ban'),
('659747468107317249', 'ping', 0, 1, 'ban'),
('659747468107317249', 'pub', 0, 1, 'ban'),
('659747468107317249', 'roleadd', 0, 1, 'ban'),
('659747468107317249', 'rolecreate', 0, 1, 'ban'),
('659747468107317249', 'roledelete', 0, 1, 'ban'),
('659747468107317249', 'roleedit', 0, 1, 'ban'),
('659747468107317249', 'spam', 0, 1, 'ban'),
('659747468107317249', 'update', 0, 1, 'ban'),
('659747468107317249', 'webhook', 0, 1, 'ban');

-- --------------------------------------------------------

--
-- Structure de la table `antiraid_logs`
--

CREATE TABLE `antiraid_logs` (
  `id` int(11) NOT NULL,
  `guild_id` varchar(20) NOT NULL,
  `channel_id` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `antiraid_logs`
--

INSERT INTO `antiraid_logs` (`id`, `guild_id`, `channel_id`, `created_at`) VALUES
(1, '659747468107317249', '1286924991836852288', '2024-10-15 11:59:29');

-- --------------------------------------------------------

--
-- Structure de la table `bot_owners`
--

CREATE TABLE `bot_owners` (
  `user_id` varchar(20) NOT NULL,
  `is_owner` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `bot_owners`
--

INSERT INTO `bot_owners` (`user_id`, `is_owner`) VALUES
('1296142657453690955', 1),
('394983502807826432', 1);

-- --------------------------------------------------------

--
-- Structure de la table `color`
--

CREATE TABLE `color` (
  `guild_id` varchar(20) NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#2f3136'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `farewell_settings`
--

CREATE TABLE `farewell_settings` (
  `guild_id` bigint(20) NOT NULL,
  `farewell_status` tinyint(1) DEFAULT 0,
  `farewell_channel` bigint(20) DEFAULT NULL,
  `farewell_message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `guild_settings`
--

CREATE TABLE `guild_settings` (
  `guild_id` varchar(20) NOT NULL,
  `prefix` varchar(10) DEFAULT '!',
  `color` varchar(7) DEFAULT '#ffffff'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `message_ping_count`
--

CREATE TABLE `message_ping_count` (
  `guild_id` varchar(20) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `message_spam_count`
--

CREATE TABLE `message_spam_count` (
  `guild_id` varchar(20) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `count` int(11) DEFAULT 0,
  `timestamp` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `message_spam_count`
--

INSERT INTO `message_spam_count` (`guild_id`, `user_id`, `count`, `timestamp`) VALUES
('1123640601062162485', '1296142657453690955', 51, 1729109870227),
('1123640601062162485', '1296153984234688645', 50, 1729109870575),
('659747468107317249', '1050191869478453258', 2, 1728993200994),
('659747468107317249', '1262097039978922067', 33, 1729021851751),
('659747468107317249', '1295455917264863386', 12, 1728934358344),
('659747468107317249', '394983502807826432', 50, 1729021851274);

-- --------------------------------------------------------

--
-- Structure de la table `pub_count`
--

CREATE TABLE `pub_count` (
  `guild_id` varchar(20) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `verify_settings`
--

CREATE TABLE `verify_settings` (
  `guild_id` varchar(20) NOT NULL,
  `verify_status` tinyint(1) DEFAULT 0,
  `verify_channel` varchar(20) DEFAULT NULL,
  `verify_role` varchar(20) DEFAULT NULL,
  `verify_message` text DEFAULT NULL,
  `verify_type` enum('button','captcha','reaction') DEFAULT 'button',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `warnings`
--

CREATE TABLE `warnings` (
  `id` int(11) NOT NULL,
  `guild_id` varchar(20) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `moderator_id` varchar(20) NOT NULL,
  `reason` text DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `warnings`
--

INSERT INTO `warnings` (`id`, `guild_id`, `user_id`, `moderator_id`, `reason`, `timestamp`) VALUES
(2, '1123640601062162485', '394983502807826432', '1296142657453690955', 'test', '2024-10-16 22:16:28');

-- --------------------------------------------------------

--
-- Structure de la table `welcome_settings`
--

CREATE TABLE `welcome_settings` (
  `guild_id` bigint(20) NOT NULL,
  `welcome_status` tinyint(1) DEFAULT 0,
  `welcome_channel` bigint(20) DEFAULT NULL,
  `welcome_message` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `whitelist`
--

CREATE TABLE `whitelist` (
  `guild_id` varchar(20) NOT NULL,
  `user_id` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `whitelist`
--

INSERT INTO `whitelist` (`guild_id`, `user_id`) VALUES
('659747468107317249', '394983502807826432');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `antiraid`
--
ALTER TABLE `antiraid`
  ADD PRIMARY KEY (`guild_id`,`event`);

--
-- Index pour la table `antiraid_logs`
--
ALTER TABLE `antiraid_logs`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `bot_owners`
--
ALTER TABLE `bot_owners`
  ADD PRIMARY KEY (`user_id`);

--
-- Index pour la table `color`
--
ALTER TABLE `color`
  ADD PRIMARY KEY (`guild_id`);

--
-- Index pour la table `farewell_settings`
--
ALTER TABLE `farewell_settings`
  ADD PRIMARY KEY (`guild_id`);

--
-- Index pour la table `guild_settings`
--
ALTER TABLE `guild_settings`
  ADD PRIMARY KEY (`guild_id`);

--
-- Index pour la table `message_ping_count`
--
ALTER TABLE `message_ping_count`
  ADD PRIMARY KEY (`guild_id`,`user_id`);

--
-- Index pour la table `message_spam_count`
--
ALTER TABLE `message_spam_count`
  ADD PRIMARY KEY (`guild_id`,`user_id`);

--
-- Index pour la table `pub_count`
--
ALTER TABLE `pub_count`
  ADD PRIMARY KEY (`guild_id`,`user_id`);

--
-- Index pour la table `verify_settings`
--
ALTER TABLE `verify_settings`
  ADD PRIMARY KEY (`guild_id`);

--
-- Index pour la table `warnings`
--
ALTER TABLE `warnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_guild_user` (`guild_id`,`user_id`);

--
-- Index pour la table `welcome_settings`
--
ALTER TABLE `welcome_settings`
  ADD PRIMARY KEY (`guild_id`);

--
-- Index pour la table `whitelist`
--
ALTER TABLE `whitelist`
  ADD PRIMARY KEY (`guild_id`,`user_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `antiraid_logs`
--
ALTER TABLE `antiraid_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `warnings`
--
ALTER TABLE `warnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
