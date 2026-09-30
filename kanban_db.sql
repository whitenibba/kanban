-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Creato il: Feb 05, 2026 alle 22:44
-- Versione del server: 8.0.45
-- Versione PHP: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kanban_db`
--

-- --------------------------------------------------------

--
-- Struttura della tabella `ADMIN`
--

CREATE TABLE `ADMIN` (
  `id_admin` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dump dei dati per la tabella `ADMIN`
--

INSERT INTO `ADMIN` (`id_admin`, `name`, `email`, `password`) VALUES
(1, 'Marco Rossi', 'marco.rossi@kanban.it', '1a1dc91c907325c69271ddf0c944bc72'),
(2, 'Elena Bianchi', 'elena.bianchi@kanban.it', '1a1dc91c907325c69271ddf0c944bc72'),
(3, 'Luca Verdi', 'luca.verdi@kanban.it', '1a1dc91c907325c69271ddf0c944bc72');

-- --------------------------------------------------------

--
-- Struttura della tabella `COLUMN`
--

CREATE TABLE `COLUMN` (
  `id_column` int NOT NULL,
  `id_project` int NOT NULL,
  `title` varchar(50) NOT NULL,
  `display_order` int NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `LOG`
--

CREATE TABLE `LOG` (
  `id_log` int NOT NULL,
  `id_task` int NOT NULL,
  `id_user` int NOT NULL,
  `action_type` varchar(50) NOT NULL,
  `details` varchar(500) DEFAULT NULL,
  `start_column` varchar(50) DEFAULT NULL,
  `end_column` varchar(50) DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `PROJECT`
--

CREATE TABLE `PROJECT` (
  `id_project` int NOT NULL,
  `id_admin` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `start_date` date NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Struttura della tabella `PROJECT_USER`
--

CREATE TABLE `PROJECT_USER` (
  `id_user` int NOT NULL,
  `id_project` int NOT NULL,
  `access_code` varchar(10) NOT NULL,
  `display_name` varchar(50) NOT NULL,
  `assigned_role` tinyint NOT NULL,
  `is_deleted` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dump dei dati per la tabella `PROJECT_USER`
--

INSERT INTO `PROJECT_USER` (`id_user`, `id_project`, `access_code`, `display_name`, `assigned_role`, `is_deleted`) VALUES
(1, 1, 'MNG-A1', 'Sandro Manager', 1, 0),
(2, 1, 'OP-A1', 'Paolo Operatore', 0, 0),
(3, 1, 'OP-A2', 'Sara Operatrice', 0, 0),
(4, 2, 'MNG-B1', 'Giorgia Manager', 1, 0),
(5, 2, 'OP-B1', 'Fabio Operatore', 0, 0),
(6, 2, 'OP-B2', 'Anna Operatrice', 0, 0),
(7, 3, 'MNG-C1', 'Roberto Manager', 1, 0),
(8, 3, 'OP-C1', 'Davide Operatore', 0, 0),
(9, 3, 'OP-C2', 'Chiara Operatrice', 0, 0);

-- --------------------------------------------------------

--
-- Struttura della tabella `TASK`
--

CREATE TABLE `TASK` (
  `id_task` int NOT NULL,
  `id_column` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` varchar(1000) DEFAULT NULL,
  `priority` int DEFAULT '0',
  `updated_at` timestamp NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indici per le tabelle scaricate
--

--
-- Indici per le tabelle `ADMIN`
--
ALTER TABLE `ADMIN`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indici per le tabelle `COLUMN`
--
ALTER TABLE `COLUMN`
  ADD PRIMARY KEY (`id_column`),
  ADD KEY `id_project` (`id_project`);

--
-- Indici per le tabelle `LOG`
--
ALTER TABLE `LOG`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `id_task` (`id_task`),
  ADD KEY `id_user` (`id_user`);

--
-- Indici per le tabelle `PROJECT`
--
ALTER TABLE `PROJECT`
  ADD PRIMARY KEY (`id_project`),
  ADD KEY `id_admin` (`id_admin`);

--
-- Indici per le tabelle `PROJECT_USER`
--
ALTER TABLE `PROJECT_USER`
  ADD PRIMARY KEY (`id_user`),
  ADD KEY `id_project` (`id_project`);

--
-- Indici per le tabelle `TASK`
--
ALTER TABLE `TASK`
  ADD PRIMARY KEY (`id_task`),
  ADD KEY `id_column` (`id_column`);

--
-- AUTO_INCREMENT per le tabelle scaricate
--

--
-- AUTO_INCREMENT per la tabella `ADMIN`
--
ALTER TABLE `ADMIN`
  MODIFY `id_admin` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT per la tabella `COLUMN`
--
ALTER TABLE `COLUMN`
  MODIFY `id_column` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `LOG`
--
ALTER TABLE `LOG`
  MODIFY `id_log` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `PROJECT`
--
ALTER TABLE `PROJECT`
  MODIFY `id_project` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `PROJECT_USER`
--
ALTER TABLE `PROJECT_USER`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT per la tabella `TASK`
--
ALTER TABLE `TASK`
  MODIFY `id_task` int NOT NULL AUTO_INCREMENT;

--
-- Limiti per le tabelle scaricate
--

--
-- Limiti per la tabella `COLUMN`
--
ALTER TABLE `COLUMN`
  ADD CONSTRAINT `COLUMN_ibfk_1` FOREIGN KEY (`id_project`) REFERENCES `PROJECT` (`id_project`) ON DELETE CASCADE;

--
-- Limiti per la tabella `LOG`
--
ALTER TABLE `LOG`
  ADD CONSTRAINT `LOG_ibfk_1` FOREIGN KEY (`id_task`) REFERENCES `TASK` (`id_task`) ON DELETE CASCADE,
  ADD CONSTRAINT `LOG_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `PROJECT_USER` (`id_user`) ON DELETE CASCADE;

--
-- Limiti per la tabella `PROJECT`
--
ALTER TABLE `PROJECT`
  ADD CONSTRAINT `PROJECT_ibfk_1` FOREIGN KEY (`id_admin`) REFERENCES `ADMIN` (`id_admin`) ON DELETE CASCADE;

--
-- Limiti per la tabella `PROJECT_USER`
--
ALTER TABLE `PROJECT_USER`
  ADD CONSTRAINT `PROJECT_USER_ibfk_1` FOREIGN KEY (`id_project`) REFERENCES `PROJECT` (`id_project`) ON DELETE CASCADE;

--
-- Limiti per la tabella `TASK`
--
ALTER TABLE `TASK`
  ADD CONSTRAINT `TASK_ibfk_1` FOREIGN KEY (`id_column`) REFERENCES `COLUMN` (`id_column`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
