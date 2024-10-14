-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 14 oct. 2024 à 21:49
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

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
('394983502807826432', 1);

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
('659747468107317249', '1050191869478453258', 1, 1728933981997),
('659747468107317249', '1295455917264863386', 12, 1728934358344),
('659747468107317249', '394983502807826432', 14, 1728934358075);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
