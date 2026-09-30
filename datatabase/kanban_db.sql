-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Creato il: Feb 15, 2026 alle 20:02
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

--
-- Dump dei dati per la tabella `COLUMN`
--

INSERT INTO `COLUMN` (`id_column`, `id_project`, `title`, `display_order`, `is_deleted`) VALUES
(0, 1, 'To Do', 1, 0),
(1, 1, 'Done', 4, 0),
(2, 1, 'In Progress', 2, 0),
(3, 1, 'Testing', 3, 0),
(10, 2, 'To Do', 1, 0),
(11, 2, 'Done', 3, 0),
(12, 2, 'Doing', 2, 0),
(20, 3, 'To Do', 1, 0),
(21, 3, 'Done', 3, 0),
(22, 3, 'Design', 2, 0),
(23, 4, 'To Do', 3, 0),
(24, 4, 'In Progress', 2, 0),
(25, 4, 'Done', 1, 0),
(26, 5, 'To Do', 3, 0),
(27, 5, 'In Progress', 2, 0),
(28, 5, 'Done', 1, 0),
(29, 6, 'To Do', 3, 0),
(30, 6, 'In Progress', 2, 0),
(31, 6, 'Done', 1, 0),
(32, 7, 'To Do', 3, 0),
(33, 7, 'In Progress', 2, 0),
(34, 7, 'Done', 1, 0),
(35, 8, 'To Do', 3, 0),
(36, 8, 'In Progress', 2, 0),
(37, 8, 'Done', 1, 0),
(38, 9, 'To Do', 0, 0),
(39, 9, 'aaasss', 1, 0),
(40, 9, 'dddd', 2, 0),
(41, 9, 'Done', 3, 0),
(42, 10, 'To Do', 0, 0),
(43, 10, 'aaasss', 1, 0),
(44, 10, 'dddd', 2, 0),
(45, 10, 'Done', 3, 0),
(46, 11, 'To Do', 0, 0),
(47, 11, 'awdawd', 1, 0),
(48, 11, 'Done', 2, 0),
(49, 12, 'To Do', 0, 0),
(50, 12, 'awdawd', 1, 0),
(51, 12, 'Done', 2, 0),
(52, 13, 'To Do', 0, 0),
(53, 13, 'awdawd', 1, 0),
(54, 13, 'Done', 2, 0),
(56, 14, 'To Do', 1, 0),
(57, 14, 'easefasewf', 2, 0),
(58, 14, 'ASEFDSAEFSAEF', 3, 0),
(59, 14, 'Done', 4, 0),
(60, 15, 'To Do', 1, 0),
(61, 15, 'Prova', 2, 0),
(62, 15, 'Done', 3, 0);

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

--
-- Dump dei dati per la tabella `PROJECT`
--

INSERT INTO `PROJECT` (`id_project`, `id_admin`, `name`, `description`, `start_date`, `is_deleted`) VALUES
(1, 1, 'Portale E-commerce', 'Sviluppo piattaforma vendite', '2026-01-10', 0),
(2, 1, 'App Mobile Fitness', 'Tracking allenamenti utenti', '2026-01-15', 0),
(3, 1, 'Restyling Dashboard', 'Ottimizzazione interfaccia admin', '2026-02-01', 0),
(4, 1, 'mammt', 'tua madre nuda\n', '2026-02-06', 1),
(5, 1, 'asdasdad', 'awwadawdawdawd', '2026-02-06', 1),
(6, 1, 'fewrfeasfew', 'eargergerg', '2026-02-06', 1),
(7, 1, 'r342e4tr', 'ehstrgstrg', '2026-02-06', 1),
(8, 1, 'fewrfeasfew123123', NULL, '2026-02-08', 1),
(9, 1, 'fsfessefa', 'aefaesfeasef', '2026-02-15', 1),
(10, 1, 'awawdawd', 'awdwda', '2026-02-15', 1),
(11, 1, 'asasddas', 'wadawd', '2026-02-15', 1),
(12, 1, 'awawd', 'awdawd', '2026-02-15', 1),
(13, 1, 'dwwdwd', 'fesfasfe', '2026-02-15', 1),
(14, 1, 'afewrrfeaw', 'feassfeagdrt', '2026-02-15', 1),
(15, 1, 'PROVA', 'PROVA', '2026-02-15', 0);

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
(2, 1, 'OP-A1', 'Paolo Operatore', 0, 1),
(3, 1, 'OP-A2', 'Sara Operatrice', 0, 1),
(4, 2, 'MNG-B1', 'Giorgia Manager', 1, 0),
(5, 2, 'OP-B1', 'Fabio Operatore', 0, 0),
(6, 2, 'OP-B2', 'Anna Operatrice', 0, 0),
(7, 3, 'MNG-C1', 'Roberto Manager', 1, 0),
(8, 3, 'OP-C1', 'Davide Operatore', 0, 0),
(9, 3, 'OP-C2', 'Chiara Operatrice', 0, 0),
(10, 1, 'dXe46S5X', 'aaa', 0, 0),
(11, 1, 'UNxW39oz', 'fausto', 0, 0),
(12, 8, 'xIIiJGdF', 'sadasd', 1, 0),
(13, 12, 'xFHSea9r', 'furio', 1, 0);

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
-- Dump dei dati per la tabella `TASK`
--

INSERT INTO `TASK` (`id_task`, `id_column`, `title`, `description`, `priority`, `updated_at`, `is_verified`, `is_deleted`) VALUES
(1, 2, 'Integrazione Stripe', 'Gestione pagamenti', 3, '2026-02-08 01:14:32', 0, 0),
(2, 1, 'Bug Fix Carrello', 'Errore calcolo IVA', 3, '2026-02-07 23:54:17', 0, 0),
(3, 1, 'Test di carico', 'Simulazione 1000 utenti', 2, '2026-02-07 23:54:32', 0, 0),
(4, 0, 'Creazione Database', 'Schema iniziale', 1, '2026-02-07 23:53:40', 0, 0),
(5, 3, 'Email di conferma', 'Template HTML', 2, '2026-02-07 23:28:53', 0, 0),
(6, 11, 'Modulo Login', 'Firebase auth', 2, '2026-02-01 22:47:18', 0, 0),
(7, 11, 'Grafici Peso', 'Integrazione Recharts', 3, '2026-01-31 22:47:18', 0, 0),
(8, 11, 'Calcolo BMI', 'Algoritmo base', 1, '2026-01-30 22:47:18', 0, 0),
(9, 12, 'UI Profilo', 'Schermata utente', 2, '2026-02-05 22:47:18', 0, 0),
(10, 22, 'Logo Admin', 'Vettorializzazione', 1, '2026-02-04 22:47:18', 0, 0),
(11, 21, 'Dark Mode', 'Implementazione CSS', 2, '2026-02-03 22:47:18', 0, 0),
(12, 20, 'Report PDF', 'Generazione server-side', 3, '2026-02-05 22:47:18', 0, 0),
(13, 2, 'AWDWAAWD', 'awdawddwsawd', 3, '2026-02-08 01:00:28', 0, 1),
(14, 1, 'ASDASD', 'awdawdawd', 0, '2026-02-08 01:02:17', 1, 0),
(15, 0, 'ASFDASDF', 'wefweffesdaf', 0, '2026-02-08 01:06:33', 0, 1),
(16, 0, 'EFSFED', 'effesfesfes', 3, '2026-02-08 01:13:14', 0, 1),
(17, 0, 'awdadw', 'wadawdadw', 2, '2026-02-08 01:14:26', 0, 1),
(18, 0, 'awdawd', 'awdwdawad', 1, '2026-02-08 01:10:39', 0, 1),
(19, 0, 'aWDadwawd', 'awdADWAWD', 0, '2026-02-08 01:10:37', 0, 1),
(20, 0, 'FABIO', 'fabiooo', 0, '2026-02-08 01:10:35', 0, 1),
(21, 0, 'MAURO', 'FAUSOT', 0, '2026-02-08 01:10:47', 0, 0),
(22, 0, 'awwaddaw', 'wdawadwd', 0, '2026-02-08 01:17:56', 0, 0),
(23, 3, 'awawdwad', 'awawddaw', 0, '2026-02-08 01:21:20', 0, 0),
(24, 0, 'aeee', 'affaewsfeas', 0, '2026-02-08 01:24:10', 0, 0),
(25, 50, 'Implementare quello', 'ADESSOOOO', 2, '2026-02-15 18:03:02', 0, 0);

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
  MODIFY `id_column` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT per la tabella `LOG`
--
ALTER TABLE `LOG`
  MODIFY `id_log` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT per la tabella `PROJECT`
--
ALTER TABLE `PROJECT`
  MODIFY `id_project` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT per la tabella `PROJECT_USER`
--
ALTER TABLE `PROJECT_USER`
  MODIFY `id_user` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT per la tabella `TASK`
--
ALTER TABLE `TASK`
  MODIFY `id_task` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

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
