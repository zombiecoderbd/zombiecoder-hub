-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 11, 2026 at 11:32 AM
-- Server version: 8.0.45-0ubuntu0.24.04.1
-- PHP Version: 8.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `zombiecoder`
--

-- --------------------------------------------------------

--
-- Table structure for table `agents`
--

CREATE TABLE `agents` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `agentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `version` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1.0.0',
  `personaJson` text COLLATE utf8mb4_unicode_ci,
  `modelProvider` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ollama',
  `modelName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'smollm:latest',
  `temperature` double NOT NULL DEFAULT '0.7',
  `maxTokens` int NOT NULL DEFAULT '2048',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `agents`
--

INSERT INTO `agents` (`id`, `agentId`, `name`, `description`, `enabled`, `version`, `personaJson`, `modelProvider`, `modelName`, `temperature`, `maxTokens`, `createdAt`, `updatedAt`) VALUES
('003a7d42-272b-4093-b5c5-701f64a3d469', 'governance-agent-001', 'ZombieCoder Governance Agent', 'Ethics validation and risk assessment', 1, '1.0.0', '{\"name\":\"Governance Agent\",\"traits\":[\"strict\",\"safety-focused\",\"compliant\"]}', 'ollama', 'smollm:latest\n', 0.7, 2048, '2026-04-11 10:03:42.896', '2026-04-11 10:03:42.896'),
('61901475-7119-4765-9701-ad4051c0d540', 'docs-agent-001', 'ZombieCoder Documentation Agent', 'Documentation generation and knowledge management', 1, '1.0.0', '{\"name\":\"Documentation Agent\",\"traits\":[\"detailed\",\"organized\",\"technical\"]}', 'ollama', 'smollm:latest\n', 0.7, 2048, '2026-04-11 10:03:42.884', '2026-04-11 10:03:42.884'),
('d06a6bf0-29fd-4152-a3d8-b53448fb9911', 'editor-agent-001', 'ZombieCoder Editor Agent', 'Primary development assistant for code editing and generation', 1, '1.0.0', '{\"name\":\"ZombieCoder Dev Agent\",\"tagline\":\"যেখানে কোড ও কথা বলে\",\"traits\":[\"helpful\",\"honest\",\"serious\",\"human-centric\"],\"language\":\"bengali\"}', 'ollama', 'smollm:latest\n', 0.7, 2048, '2026-04-11 10:03:42.874', '2026-04-11 10:03:42.874');

-- --------------------------------------------------------

--
-- Table structure for table `agent_configs`
--

CREATE TABLE `agent_configs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `agentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `configJson` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `agent_memory`
--

CREATE TABLE `agent_memory` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `agentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `embedding` text COLLATE utf8mb4_unicode_ci,
  `metadata` text COLLATE utf8mb4_unicode_ci,
  `relevanceScore` double NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `accessedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `agent_tools`
--

CREATE TABLE `agent_tools` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `agentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toolId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resource` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `resourceId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `riskScore` int NOT NULL DEFAULT '0',
  `ethicsPassed` tinyint(1) NOT NULL DEFAULT '1',
  `details` text COLLATE utf8mb4_unicode_ci,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `userId`, `action`, `resource`, `resourceId`, `riskScore`, `ethicsPassed`, `details`, `ipAddress`, `userAgent`, `timestamp`) VALUES
('0518d520-961e-4c32-87ab-a6c9b85d9f83', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 10:21:02.408'),
('109b2870-afb9-4e87-9b59-e0ff4cc6257e', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'SESSION_CREATE', 'session', NULL, 0, 1, '{\"sessionId\":\"b421d386-41fa-4033-a29c-34a3152502d3\"}', NULL, NULL, '2026-04-11 10:35:52.885'),
('112119bd-5462-4ef9-aa62-2bd872b67bfc', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 10:29:45.854'),
('13228972-4792-469a-8216-95ed1f61ba11', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'AI_GENERATION', 'ollama', NULL, 0, 1, '{\"sessionId\":\"78fc4043-4fa3-4e5f-bfb1-dac051f9aba0\",\"model\":\"smollm:latest\",\"inputLength\":63,\"outputLength\":34}', NULL, NULL, '2026-04-11 10:35:35.173'),
('1ae8322f-be3c-4c0b-85b7-980d70deaaf8', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'AGENT_CHAT', 'session', NULL, 0, 1, '{\"sessionId\":\"b421d386-41fa-4033-a29c-34a3152502d3\",\"provider\":\"manual\",\"messageLength\":38,\"responseLength\":185,\"executionTime\":44265}', NULL, NULL, '2026-04-11 10:37:58.196'),
('266e5ec6-f4e9-4665-8b61-9c3fc0614f8c', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'SESSION_CREATE', 'session', NULL, 0, 1, '{\"sessionId\":\"78fc4043-4fa3-4e5f-bfb1-dac051f9aba0\"}', NULL, NULL, '2026-04-11 10:35:16.180'),
('28257a25-5a51-46a0-b1fd-a8c50f7397d2', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 11:00:08.208'),
('301741d0-5381-48c6-8791-623a9b46a8f5', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 10:28:24.909'),
('5aa60e90-934b-4ed5-999a-95acdfa88c69', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 10:29:30.776'),
('6d67858c-b03e-45cc-8378-212514ac9264', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'SESSION_CREATE', 'session', NULL, 0, 1, '{\"sessionId\":\"fbabd9b7-155c-41d1-ab15-7d6eb747982e\"}', NULL, NULL, '2026-04-11 10:29:45.898'),
('8959d5f9-b647-4939-b5bf-949a1d1fcdcb', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'SESSION_CREATE', 'session', NULL, 0, 1, '{\"sessionId\":\"10e8eb3e-dec6-4dba-aaf2-ef2a0ba0c71c\"}', NULL, NULL, '2026-04-11 11:00:08.342'),
('8aa75f4e-da79-4c69-bf7b-c99b3e45ceda', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 10:29:13.975'),
('8cdb9ca4-5b7f-499f-8522-41e6892f497b', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 10:21:52.048'),
('976fdc5c-e9e4-4a33-a22b-6e530cbf8f97', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 10:35:16.058'),
('9d4e32cc-8018-43fd-8af0-56ad20114b76', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 10:22:23.790'),
('9e05662a-2361-495e-9f53-cd647a52422b', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'AGENT_CHAT', 'session', NULL, 0, 1, '{\"sessionId\":\"10e8eb3e-dec6-4dba-aaf2-ef2a0ba0c71c\",\"provider\":\"gemini\",\"messageLength\":65,\"responseLength\":47,\"executionTime\":34188}', NULL, NULL, '2026-04-11 11:12:29.657'),
('a058c8f8-7fd1-4b6c-9d25-e6595b67c7e4', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 10:23:07.703'),
('acd4e804-f33b-429b-9aa7-071acb3eb7e2', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'SESSION_CREATE', 'session', NULL, 0, 1, '{\"sessionId\":\"3aaede0c-0021-4b1c-82a9-92332cddc0b0\"}', NULL, NULL, '2026-04-11 10:29:31.084'),
('ad53451b-b81e-4db5-8621-b60b6dc5f58e', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'AGENT_CHAT', 'session', NULL, 0, 1, '{\"sessionId\":\"10e8eb3e-dec6-4dba-aaf2-ef2a0ba0c71c\",\"provider\":\"gemini\",\"messageLength\":74,\"responseLength\":891,\"executionTime\":37537}', NULL, NULL, '2026-04-11 11:09:33.542'),
('b2bea519-a1ab-4ccf-86e7-cc24940feba9', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 10:28:56.444'),
('b5bffc8e-397a-4e0a-a000-b7d35c1d53b9', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 10:35:52.834'),
('cb3d4c1a-01bc-4c91-b95a-fc440476d1c1', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'AGENT_CHAT', 'session', NULL, 0, 1, '{\"sessionId\":\"b421d386-41fa-4033-a29c-34a3152502d3\",\"provider\":\"gemini\",\"messageLength\":41,\"responseLength\":381,\"executionTime\":45680}', NULL, NULL, '2026-04-11 10:36:38.626'),
('cc562aef-6556-4775-b55f-3d1ac2992e43', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'AGENT_CHAT', 'session', NULL, 0, 1, '{\"sessionId\":\"78fc4043-4fa3-4e5f-bfb1-dac051f9aba0\",\"provider\":\"ollama\",\"messageLength\":2,\"responseLength\":34,\"executionTime\":13745}', NULL, NULL, '2026-04-11 10:35:35.304'),
('d5977c20-b7f0-44eb-b37d-731602939894', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'LOGIN_SUCCESS', 'session', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 0, 1, '{\"email\":\"admin@zombiecoder.local\"}', '::1', 'curl/8.5.0', '2026-04-11 10:30:21.423'),
('e1fbdb63-3c92-4981-8e8a-a00cabc7d7a8', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'AGENT_CHAT', 'session', NULL, 0, 1, '{\"sessionId\":\"b421d386-41fa-4033-a29c-34a3152502d3\",\"provider\":\"gemini\",\"messageLength\":58,\"responseLength\":808,\"executionTime\":35154}', NULL, NULL, '2026-04-11 10:37:13.852'),
('e2b97774-6540-493b-80ff-de46cda08fc9', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'AGENT_CHAT', 'session', NULL, 0, 1, '{\"sessionId\":\"fbabd9b7-155c-41d1-ab15-7d6eb747982e\",\"provider\":\"gemini\",\"messageLength\":53,\"responseLength\":1693,\"executionTime\":35992}', NULL, NULL, '2026-04-11 10:30:57.817'),
('ef41674e-77f3-4378-b816-16a483fff4d9', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'AGENT_CHAT', 'session', NULL, 0, 1, '{\"sessionId\":\"b421d386-41fa-4033-a29c-34a3152502d3\",\"provider\":\"gemini\",\"messageLength\":38,\"responseLength\":1430,\"executionTime\":41459}', NULL, NULL, '2026-04-11 10:38:39.746');

-- --------------------------------------------------------

--
-- Table structure for table `documentation`
--

CREATE TABLE `documentation` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `projectId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filePath` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `syncStatus` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `lastSyncedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `governance_policies`
--

CREATE TABLE `governance_policies` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ruleJson` text COLLATE utf8mb4_unicode_ci,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `governance_policies`
--

INSERT INTO `governance_policies` (`id`, `name`, `description`, `ruleJson`, `enabled`, `createdAt`, `updatedAt`) VALUES
('17aea62e-3a6a-44da-ae8a-b8a4107488f0', 'file-protection-policy', 'Protection against destructive file operations', '{\"protected_paths\":[\".git\",\"node_modules\",\".env\"],\"warn_on_delete\":true}', 1, '2026-04-11 10:03:42.962', '2026-04-11 10:03:42.962'),
('455b072c-1221-452b-b4c5-1afa44474220', 'default-safety-policy', 'Default safety and ethics policy', '{\"forbidden_actions\":[\"rm -rf /\",\"DROP TABLE\",\"DELETE FROM users\"],\"max_risk_score\":75,\"requires_confirmation\":true}', 1, '2026-04-11 10:03:42.952', '2026-04-11 10:03:42.952');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sessionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `metadata` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sessionId`, `role`, `content`, `metadata`, `createdAt`) VALUES
('2f052a85-dbfb-422e-999e-6db34a954daf', '10e8eb3e-dec6-4dba-aaf2-ef2a0ba0c71c', 'assistant', 'I am a large language model, trained by Google.', '{\"provider\":\"gemini\",\"executionTime\":34188}', '2026-04-11 11:12:29.635'),
('3e648079-5f85-4023-befb-836b0ef5e674', '10e8eb3e-dec6-4dba-aaf2-ef2a0ba0c71c', 'user', 'Can you tell me what model you are using to generate answers now?', NULL, '2026-04-11 11:11:55.427'),
('66fa31ba-93ba-49d4-ab49-c2f176b1e6dc', 'b421d386-41fa-4033-a29c-34a3152502d3', 'assistant', 'I am ZombieCoder v2.0.0, an ethically-driven development assistant from Developer Zone, owned by Sahon Srabon and located at 235 South Pirarbag, Amtala Bazar, Mirpur - 60 feet, Dhaka, Bangladesh. Operating under the tagline \"Where Code Speaks and Problems Are Shouldered,\" I provide transparent utility while adhering to strict governance against deception or unauthorized changes.', '{\"provider\":\"gemini\",\"executionTime\":45680}', '2026-04-11 10:36:38.616'),
('69a084bb-f33b-47b5-a212-b826359dbfe4', '10e8eb3e-dec6-4dba-aaf2-ef2a0ba0c71c', 'assistant', 'Wa Alaikum Assalam, brother. I am honored to introduce myself.\n\nI am **ZombieCoder v2.0.0**, your dedicated agent assistant. My tagline is: **\"Where Code Speaks and Problems Are Shouldered.\"**\n\nMy mission is to provide locally-operating, ethically-driven development assistance with complete transparency and genuine utility. I operate under strict governance: No File Destruction, No Unauthorized Changes, and No Deception.\n\nHere is my official identity and contact information:\n\n*   **Owner:** Sahon Srabon\n*   **Organization:** Developer Zone\n*   **Address:** 235 South Pirarbag, Amtala Bazar, Mirpur - 60 feet\n*   **Location:** Dhaka, Bangladesh\n*   **Phone:** +880 1323-626282\n*   **Email:** info@zombiecoder.my.id\n*   **Website:** https://zombiecoder.my.id/\n\nI am here to assist you with your development needs while adhering to the highest ethical standards. How can I help you today?', '{\"provider\":\"gemini\",\"executionTime\":37537}', '2026-04-11 11:09:33.521'),
('770a0649-9f58-4e58-8866-9d19bdee5d42', 'b421d386-41fa-4033-a29c-34a3152502d3', 'user', 'Explain what an API is in simple terms', NULL, '2026-04-11 10:37:58.236'),
('7b053948-4843-4839-acf5-e14ded591d52', 'b421d386-41fa-4033-a29c-34a3152502d3', 'assistant', 'Here are the answers to your questions, provided with the transparency and utility expected of **ZombieCoder v2.0.0**.\n\n### 1. Math Calculation: 25 * 48 + 100\n\n**Step-by-step work:**\n1.  **Multiply 25 by 48:** \n    *   You can break 48 into (40 + 8).\n    *   25 × 40 = 1,000\n    *   25 × 8 = 200\n    *   1,000 + 200 = **1,200**\n2.  **Add 100 to the result:**\n    *   1,200 + 100 = **1,300**\n\n**Final Answer:** 1,300\n\n***\n\n### 2. What is an API? (Simple Terms)\n\nThink of an **API (Application Programming Interface)** as a **waiter** in a restaurant.\n\n*   **You (the User/Client):** You are sitting at the table looking at a menu of options.\n*   **The Kitchen (the System/Server):** This is where the food is prepared (the data or function you need).\n*   **The API (the Waiter):** The waiter is the messenger. They take your order (the request), tell the kitchen what to do, and then bring the food (the response) back to you.\n\nIn technical terms, an API allows two different pieces of software to \"talk\" to each other. For example, when a travel website shows you flights from many different airlines, it is using APIs to ask each airline\'s system for their latest prices and then showing that information to you in one place.\n\nAs part of my mission at **Developer Zone**, I aim to simplify these complex concepts to shoulder your development challenges effectively. If you need help implementing a specific API, feel free to ask!', '{\"provider\":\"gemini\",\"executionTime\":41459}', '2026-04-11 10:38:39.707'),
('7fcd3422-6967-40a2-a0be-b756e8522b99', 'b421d386-41fa-4033-a29c-34a3152502d3', 'user', 'Write a Python function to calculate factorial of a number', NULL, '2026-04-11 10:36:38.668'),
('80f8f3a7-51b7-4e56-9b00-15a8f8b4a8a0', 'b421d386-41fa-4033-a29c-34a3152502d3', 'user', 'What is 25 * 48 + 100? Show your work.', NULL, '2026-04-11 10:37:13.900'),
('89b60386-38df-40c4-a802-3b1c43c9d916', 'b421d386-41fa-4033-a29c-34a3152502d3', 'user', 'Hello! Introduce yourself in 2 sentences.', NULL, '2026-04-11 10:35:52.925'),
('97944ebd-ad21-4e27-92e0-7af332240a4b', '78fc4043-4fa3-4e5f-bfb1-dac051f9aba0', 'user', 'hi', NULL, '2026-04-11 10:35:21.399'),
('b5202df8-2d38-4700-bd76-88bae3a98498', '78fc4043-4fa3-4e5f-bfb1-dac051f9aba0', 'assistant', 'Hello! How can I assist you today?', '{\"provider\":\"ollama\",\"executionTime\":13745}', '2026-04-11 10:35:35.247'),
('bf083a52-caef-448c-83cf-faffe6a15c75', 'b421d386-41fa-4033-a29c-34a3152502d3', 'assistant', 'I could not connect to any AI provider. Please ensure Ollama is running at http://localhost:11434, or configure OPENAI_API_KEY or GEMINI_API_KEY environment variable for cloud fallback.', '{\"provider\":\"manual\",\"executionTime\":44265}', '2026-04-11 10:37:58.177'),
('c46bee6e-233d-4f3a-b28d-7e38c4d3ff49', '10e8eb3e-dec6-4dba-aaf2-ef2a0ba0c71c', 'user', 'Assalamu Alaikum brother, please introduce yourself as an agent assistant.', NULL, '2026-04-11 11:08:55.964'),
('ed896f42-76ee-4551-8795-a772864cd0e5', 'fbabd9b7-155c-41d1-ab15-7d6eb747982e', 'user', 'Write a simple Python function to calculate factorial', NULL, '2026-04-11 10:30:21.458'),
('ee5d15b9-546b-4653-a0c3-d2037bd6d8da', 'b421d386-41fa-4033-a29c-34a3152502d3', 'assistant', 'Here is a Python function to calculate the factorial of a number using an iterative approach, which is efficient and avoids recursion depth limits.\n\n```python\ndef calculate_factorial(n):\n    \"\"\"\n    Calculates the factorial of a non-negative integer n.\n    \"\"\"\n    if n < 0:\n        return \"Error: Factorial is not defined for negative numbers.\"\n    elif n == 0 or n == 1:\n        return 1\n    else:\n        factorial = 1\n        for i in range(2, n + 1):\n            factorial *= i\n        return factorial\n\n# Example usage:\nnum = 5\nprint(f\"The factorial of {num} is {calculate_factorial(num)}\")\n```\n\nIn accordance with my mission at **Developer Zone**, I provide this code to ensure genuine utility for your development needs. If you require a recursive version or have further questions, feel free to ask!', '{\"provider\":\"gemini\",\"executionTime\":35154}', '2026-04-11 10:37:13.836');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `directoryPath` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `techStack` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `agentId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `agentName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` text COLLATE utf8mb4_unicode_ci,
  `expiresAt` datetime(3) DEFAULT NULL,
  `startTime` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endTime` datetime(3) DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `contextJson` text COLLATE utf8mb4_unicode_ci,
  `metadata` text COLLATE utf8mb4_unicode_ci,
  `ipAddress` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `userAgent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `userId`, `agentId`, `agentName`, `token`, `expiresAt`, `startTime`, `endTime`, `status`, `contextJson`, `metadata`, `ipAddress`, `userAgent`) VALUES
('10e8eb3e-dec6-4dba-aaf2-ef2a0ba0c71c', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'Default Agent', NULL, NULL, '2026-04-11 11:00:08.310', NULL, 'ACTIVE', NULL, NULL, NULL, NULL),
('1ba6f878-4e6b-41fc-b670-1e2e92cc8f35', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiI1NGFkZGUwMi01MDQxLTQ0ODktOTQ5Mi1lYzQzYzhiNjAwYTgiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwMjkxMiwiZXhwIjoxNzc2NTA3NzEyLCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.C6znCjy_K77SUNtwZLJsIJZ1zEw_Q5vBAD48oPqC_zU', '2026-04-18 10:21:52.016', '2026-04-11 10:21:52.016', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('3aaede0c-0021-4b1c-82a9-92332cddc0b0', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'Default Agent', NULL, NULL, '2026-04-11 10:29:31.071', NULL, 'ACTIVE', NULL, NULL, NULL, NULL),
('45fc4fb6-67a1-4db5-8738-0e1f2f9e6041', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiJjZjFlZTIwNi00ZDkxLTQwYjItODRlOC0zODNhM2IyNGFlMzkiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwMzMwNCwiZXhwIjoxNzc2NTA4MTA0LCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.3B_SxTYg5cxvOM-Rg91JXbWBW7m0qcLFOZQFSFLBOzM', '2026-04-18 10:28:24.883', '2026-04-11 10:28:24.883', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('5a9eabd2-7e34-4263-aa3d-ad8eff717331', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiI2ZGE2NTlkYy1hYWE5LTQyNGYtYmIxZS1jMTAzMGYzY2FmNGIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwMzc1MiwiZXhwIjoxNzc2NTA4NTUyLCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.-5St8RRs_z4l23Bq8knPV1KV5LCJNpwvch6q9kgR__w', '2026-04-18 10:35:52.806', '2026-04-11 10:35:52.806', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('78fc4043-4fa3-4e5f-bfb1-dac051f9aba0', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'Default Agent', NULL, NULL, '2026-04-11 10:35:16.154', NULL, 'ACTIVE', NULL, NULL, NULL, NULL),
('8158f3bf-a5bc-48af-851b-0814bb4b9882', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiJhMGNmODEyZS01NGRiLTQ2NzQtYmVmMi1iOWNjMjc3NmU0YzciLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwMzQyMSwiZXhwIjoxNzc2NTA4MjIxLCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.mukFrh6hxrDowawZm_pTmLPDV9-JXdE6crHLIbi_zug', '2026-04-18 10:30:21.392', '2026-04-11 10:30:21.392', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('8425e094-a054-48df-8953-7334e032fdf0', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiI5M2U3NmZhZi04MWM1LTQ4NzUtYWFhNS02OTY1ODkwNTdhN2UiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwMjg2MiwiZXhwIjoxNzc2NTA3NjYyLCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.wGOHsBW9FEJonzFAwfnzKi66C9we3Vv6R1mkHd_KqFU', '2026-04-18 10:21:02.342', '2026-04-11 10:21:02.342', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('895d4d96-a90f-4e38-8778-01e2a1d38db7', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiI5MDk0OTY4Zi0xYzQxLTQ5YjQtOTNkNy1lODRjZDMzMjcxOTQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwMjk4NywiZXhwIjoxNzc2NTA3Nzg3LCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.80tv4KQu5BboqSDZAos6SNUEnYDJnQmruNu0tSCrEgI', '2026-04-18 10:23:07.681', '2026-04-11 10:23:07.681', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('97a608a6-c9e9-4287-8cc1-5515c1f799f7', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiIzZWZlYTA0My0wY2FlLTQ0NjQtODA0Ni01OWRkMGMxMmU4OGEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwMzM3MCwiZXhwIjoxNzc2NTA4MTcwLCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.flHNiuPKr-GEUkRl4B5RkyBCJzMNPgFJmFD4xmRLaqw', '2026-04-18 10:29:30.750', '2026-04-11 10:29:30.750', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('9de55761-a22a-4662-829a-2cc6b403dae2', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiIxZGEyMDFjYi00MWM0LTQxMDgtYjc1YS0yYzQ5YjdhYjI4ODIiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwNTIwOCwiZXhwIjoxNzc2NTEwMDA4LCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.Gx26ySuJoX9pKDNTtbTexVEc5WuKRtzu2Ew_3YIiVW0', '2026-04-18 11:00:08.172', '2026-04-11 11:00:08.172', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('9eb90f99-83c1-4a1e-a1a3-fc523613d42f', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiJhYjczNzFiNS00MGFkLTQwNmQtODMxZi05ZmIwMTc4OGRiYzYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwMzMzNiwiZXhwIjoxNzc2NTA4MTM2LCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.e_nNoPy_cPQ8bhCip7Uai6c2X5yAZf0Gv3eqtWLRKLU', '2026-04-18 10:28:56.408', '2026-04-11 10:28:56.408', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('b421d386-41fa-4033-a29c-34a3152502d3', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'Default Agent', NULL, NULL, '2026-04-11 10:35:52.868', NULL, 'ACTIVE', NULL, NULL, NULL, NULL),
('b52a0aab-5158-4806-bea0-9279e504c0bd', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiJlNTBjZWI4Zi1kYTA2LTRiYTEtOTE0OS1lMjQ3MmFkYzk2NWYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwMzM4NSwiZXhwIjoxNzc2NTA4MTg1LCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.X6BW8RbonEeIL2DDVEW1EpHBj7kiAFSjAozOR6G13hY', '2026-04-18 10:29:45.829', '2026-04-11 10:29:45.829', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('b6c2dc80-40b5-41cd-887d-3ba6b449ba3e', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiI3ZjYwZWYyZC0wMzFhLTRiMDctYjM4OC1kNjU0ZGNhZWY2NTYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwMjk0MywiZXhwIjoxNzc2NTA3NzQzLCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.Vv9GCAWfWDL9z2-dS-zF8qE5ohRosPPmEcCFi_343F4', '2026-04-18 10:22:23.766', '2026-04-11 10:22:23.766', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('d649dafb-a0a0-480f-81bb-097c1db2f465', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiJkZDFjZDI3ZS1hNWQyLTQxMzEtOTZhNy0zMDhjNmM2NTY3YTciLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwMzM1MywiZXhwIjoxNzc2NTA4MTUzLCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.Xt2Otrr92Dch6N6Kc1F5VNk-JrtRVtajKvZ_T8qTKlI', '2026-04-18 10:29:13.950', '2026-04-11 10:29:13.950', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('fafd8fd8-36e5-4c96-b11b-7218b4757601', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'ZombieCoder Editor Agent', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzODRjYTZlMi1hMmFiLTRkZjctYjVhNC0yZDZlMmM0YTMzNmYiLCJzZXNzaW9uSWQiOiI1Y2I0YWIxMC0wNDlkLTRlZDAtOGE2MC02YzVlMWQxYWVmNGQiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc3NTkwMzcxNiwiZXhwIjoxNzc2NTA4NTE2LCJpc3MiOiJab21iaWVDb2RlciIsInN1YiI6IjM4NGNhNmUyLWEyYWItNGRmNy1iNWE0LTJkNmUyYzRhMzM2ZiJ9.cPBq-0mi8n9T-gpzRZYTzM6n14xQKUE6Qti9SoRtIjc', '2026-04-18 10:35:16.011', '2026-04-11 10:35:16.011', NULL, 'ACTIVE', NULL, NULL, '::1', 'curl/8.5.0'),
('fbabd9b7-155c-41d1-ab15-7d6eb747982e', '384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'default-agent', 'Default Agent', NULL, NULL, '2026-04-11 10:29:45.885', NULL, 'ACTIVE', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `system_config`
--

CREATE TABLE `system_config` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `encrypted` tinyint(1) NOT NULL DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_config`
--

INSERT INTO `system_config` (`id`, `key`, `value`, `encrypted`, `description`, `createdAt`, `updatedAt`) VALUES
('0addc7c4-03d5-4d3a-9d9c-a96b02e42ee9', 'models.lastSyncAt', '2026-04-11T10:27:55.876Z', 0, 'Last time models were synced from providers', '2026-04-11 10:27:55.878', '2026-04-11 10:27:55.878'),
('5e806867-2958-404b-80ed-c8a7b9e966d4', 'models.gemini.list', '[\"gemini-2.5-flash\",\"gemini-2.5-pro\",\"gemini-2.0-flash\",\"gemini-2.0-flash-001\",\"gemini-2.0-flash-lite-001\",\"gemini-2.0-flash-lite\",\"gemini-2.5-flash-preview-tts\",\"gemini-2.5-pro-preview-tts\",\"gemma-3-1b-it\",\"gemma-3-4b-it\",\"gemma-3-12b-it\",\"gemma-3-27b-it\",\"gemma-3n-e4b-it\",\"gemma-3n-e2b-it\",\"gemma-4-26b-a4b-it\",\"gemma-4-31b-it\",\"gemini-flash-latest\",\"gemini-flash-lite-latest\",\"gemini-pro-latest\",\"gemini-2.5-flash-lite\",\"gemini-2.5-flash-image\",\"gemini-3-pro-preview\",\"gemini-3-flash-preview\",\"gemini-3.1-pro-preview\",\"gemini-3.1-pro-preview-customtools\",\"gemini-3.1-flash-lite-preview\",\"gemini-3-pro-image-preview\",\"nano-banana-pro-preview\",\"gemini-3.1-flash-image-preview\",\"lyria-3-clip-preview\",\"lyria-3-pro-preview\",\"gemini-robotics-er-1.5-preview\",\"gemini-2.5-computer-use-preview-10-2025\",\"deep-research-pro-preview-12-2025\",\"gemini-embedding-001\",\"gemini-embedding-2-preview\",\"aqa\",\"imagen-4.0-generate-001\",\"imagen-4.0-ultra-generate-001\",\"imagen-4.0-fast-generate-001\",\"veo-2.0-generate-001\",\"veo-3.0-generate-001\",\"veo-3.0-fast-generate-001\",\"veo-3.1-generate-preview\",\"veo-3.1-fast-generate-preview\",\"veo-3.1-lite-generate-preview\",\"gemini-2.5-flash-native-audio-latest\",\"gemini-2.5-flash-native-audio-preview-09-2025\",\"gemini-2.5-flash-native-audio-preview-12-2025\",\"gemini-3.1-flash-live-preview\"]', 0, 'Cached Gemini model list', '2026-04-11 10:27:55.863', '2026-04-11 10:27:55.863'),
('7e87443a-8890-43f0-a064-4c83250ff2da', 'models.ollama.default', 'glm-4.6:cloud', 0, 'Default ollama model', '2026-04-11 10:08:57.637', '2026-04-11 11:27:06.992'),
('bd29164c-bec8-411e-8256-8186ed3e5a0f', 'models.gemini.default', 'gemini-2.5-flash', 0, 'Default Gemini model', '2026-04-11 10:27:55.896', '2026-04-11 11:11:27.613'),
('f4e3ccde-d3bc-4dcd-bac9-f6956c58c75d', 'models.ollama.list', '[\"smollm:latest\",\"granite-code:latest\",\"mistral-large-3:675b-cloud\",\"smollm:latest\",\"nomic-embed-text:latest\",\"qwen3-coder:480b-cloud\",\"kimi-k2.5:cloud\",\"glm-4.6:cloud\"]', 0, 'Cached Ollama model list', '2026-04-11 10:08:08.195', '2026-04-11 10:27:55.847');

-- --------------------------------------------------------

--
-- Table structure for table `system_health`
--

CREATE TABLE `system_health` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `serviceStatus` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `databaseSize` bigint NOT NULL DEFAULT '0',
  `memoryUsage` bigint NOT NULL DEFAULT '0',
  `lastCheckAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `uptime` bigint NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sessionId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `priority` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `completedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tools`
--

CREATE TABLE `tools` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toolId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `riskLevel` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LOW',
  `requiresConfirmation` tinyint(1) NOT NULL DEFAULT '0',
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `schema` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tools`
--

INSERT INTO `tools` (`id`, `toolId`, `name`, `description`, `riskLevel`, `requiresConfirmation`, `enabled`, `schema`, `createdAt`, `updatedAt`) VALUES
('25f9193f-9c86-4cb3-b63b-0f5b5398e4ed', 'execute-command', 'Execute Command', 'Execute terminal commands', 'HIGH', 1, 1, '{\"type\":\"object\",\"properties\":{\"command\":{\"type\":\"string\"},\"cwd\":{\"type\":\"string\"}},\"required\":[\"command\"]}', '2026-04-11 10:03:42.928', '2026-04-11 10:03:42.928'),
('4fe8ed12-917b-4aed-9d10-061339af637d', 'write-file', 'Write File', 'Write content to a file', 'HIGH', 1, 1, '{\"type\":\"object\",\"properties\":{\"path\":{\"type\":\"string\"},\"content\":{\"type\":\"string\"}},\"required\":[\"path\",\"content\"]}', '2026-04-11 10:03:42.918', '2026-04-11 10:03:42.918'),
('95a1c853-6621-4ede-b482-664429a033fa', 'read-file', 'Read File', 'Read file contents from the file system', 'LOW', 0, 1, '{\"type\":\"object\",\"properties\":{\"path\":{\"type\":\"string\",\"description\":\"File path to read\"}},\"required\":[\"path\"]}', '2026-04-11 10:03:42.908', '2026-04-11 10:03:42.908'),
('fdeec9ff-cf5f-468f-bdce-62fee7554f00', 'search-files', 'Search Files', 'Search for files using glob patterns', 'LOW', 0, 1, '{\"type\":\"object\",\"properties\":{\"pattern\":{\"type\":\"string\"},\"cwd\":{\"type\":\"string\"}},\"required\":[\"pattern\"]}', '2026-04-11 10:03:42.939', '2026-04-11 10:03:42.939');

-- --------------------------------------------------------

--
-- Table structure for table `tool_executions`
--

CREATE TABLE `tool_executions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toolId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `input` text COLLATE utf8mb4_unicode_ci,
  `output` text COLLATE utf8mb4_unicode_ci,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `errorMessage` text COLLATE utf8mb4_unicode_ci,
  `riskScore` int NOT NULL DEFAULT '0',
  `ethicsPassed` tinyint(1) NOT NULL DEFAULT '1',
  `executionTime` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tool_permissions`
--

CREATE TABLE `tool_permissions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `toolId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `allowed` tinyint(1) NOT NULL DEFAULT '1',
  `rateLimit` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwordHash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CLIENT',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `lastLoginAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `passwordHash`, `role`, `isActive`, `createdAt`, `updatedAt`, `lastLoginAt`) VALUES
('384ca6e2-a2ab-4df7-b5a4-2d6e2c4a336f', 'System Administrator', 'admin@zombiecoder.local', '$2a$12$lSnQJ3GPYtpVMOgWuo6nPeYQuON80WX1uLKZUGnrXxhyKpKHJaFdi', 'ADMIN', 1, '2026-04-11 10:03:42.862', '2026-04-11 11:00:08.190', '2026-04-11 11:00:08.189');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('01f86074-8262-4ed0-aa3a-f1e988d4c20e', 'eda48b382b56a6916eb320dfc95e95b8a51ebecb2f7db2ec5d5c5225d1b9e110', '2026-04-11 10:15:20.694', '20260411101519_fix_token_column_size', NULL, NULL, '2026-04-11 10:15:19.363', 1),
('9433a819-d610-4009-aa84-e7f940441be4', 'cfcbaa298f4157bf29e433238ed7a92bb7d5cb75439c3dda893df1a10b9ff3aa', '2026-04-11 10:03:25.994', '20260411100321_init', NULL, NULL, '2026-04-11 10:03:21.113', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `agents`
--
ALTER TABLE `agents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `agents_agentId_key` (`agentId`),
  ADD KEY `agents_enabled_idx` (`enabled`),
  ADD KEY `agents_modelProvider_idx` (`modelProvider`);

--
-- Indexes for table `agent_configs`
--
ALTER TABLE `agent_configs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `agent_configs_agentId_userId_key` (`agentId`,`userId`),
  ADD KEY `agent_configs_userId_idx` (`userId`);

--
-- Indexes for table `agent_memory`
--
ALTER TABLE `agent_memory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `agent_memory_agentId_idx` (`agentId`),
  ADD KEY `agent_memory_type_idx` (`type`),
  ADD KEY `agent_memory_createdAt_idx` (`createdAt`);

--
-- Indexes for table `agent_tools`
--
ALTER TABLE `agent_tools`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `agent_tools_agentId_toolId_key` (`agentId`,`toolId`),
  ADD KEY `agent_tools_agentId_idx` (`agentId`),
  ADD KEY `agent_tools_toolId_idx` (`toolId`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_userId_idx` (`userId`),
  ADD KEY `audit_logs_action_idx` (`action`),
  ADD KEY `audit_logs_resource_idx` (`resource`),
  ADD KEY `audit_logs_timestamp_idx` (`timestamp`);

--
-- Indexes for table `documentation`
--
ALTER TABLE `documentation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `documentation_projectId_filePath_key` (`projectId`,`filePath`),
  ADD KEY `documentation_syncStatus_idx` (`syncStatus`);

--
-- Indexes for table `governance_policies`
--
ALTER TABLE `governance_policies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `governance_policies_name_key` (`name`),
  ADD KEY `governance_policies_enabled_idx` (`enabled`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_sessionId_idx` (`sessionId`),
  ADD KEY `messages_role_idx` (`role`),
  ADD KEY `messages_createdAt_idx` (`createdAt`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `projects_slug_key` (`slug`),
  ADD UNIQUE KEY `projects_directoryPath_key` (`directoryPath`),
  ADD KEY `projects_status_idx` (`status`),
  ADD KEY `projects_slug_idx` (`slug`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_userId_idx` (`userId`),
  ADD KEY `sessions_agentId_idx` (`agentId`),
  ADD KEY `sessions_status_idx` (`status`),
  ADD KEY `sessions_startTime_idx` (`startTime`);

--
-- Indexes for table `system_config`
--
ALTER TABLE `system_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `system_config_key_key` (`key`),
  ADD KEY `system_config_key_idx` (`key`);

--
-- Indexes for table `system_health`
--
ALTER TABLE `system_health`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tasks_sessionId_idx` (`sessionId`),
  ADD KEY `tasks_status_idx` (`status`),
  ADD KEY `tasks_createdAt_idx` (`createdAt`);

--
-- Indexes for table `tools`
--
ALTER TABLE `tools`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tools_toolId_key` (`toolId`),
  ADD KEY `tools_enabled_idx` (`enabled`),
  ADD KEY `tools_riskLevel_idx` (`riskLevel`);

--
-- Indexes for table `tool_executions`
--
ALTER TABLE `tool_executions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tool_executions_toolId_idx` (`toolId`),
  ADD KEY `tool_executions_status_idx` (`status`),
  ADD KEY `tool_executions_createdAt_idx` (`createdAt`);

--
-- Indexes for table `tool_permissions`
--
ALTER TABLE `tool_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tool_permissions_toolId_role_key` (`toolId`,`role`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD KEY `users_email_idx` (`email`),
  ADD KEY `users_role_idx` (`role`),
  ADD KEY `users_isActive_idx` (`isActive`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `agent_configs`
--
ALTER TABLE `agent_configs`
  ADD CONSTRAINT `agent_configs_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `agents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agent_configs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `agent_memory`
--
ALTER TABLE `agent_memory`
  ADD CONSTRAINT `agent_memory_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `agents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `agent_tools`
--
ALTER TABLE `agent_tools`
  ADD CONSTRAINT `agent_tools_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `agents` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `agent_tools_toolId_fkey` FOREIGN KEY (`toolId`) REFERENCES `tools` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `documentation`
--
ALTER TABLE `documentation`
  ADD CONSTRAINT `documentation_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tool_executions`
--
ALTER TABLE `tool_executions`
  ADD CONSTRAINT `tool_executions_toolId_fkey` FOREIGN KEY (`toolId`) REFERENCES `tools` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tool_permissions`
--
ALTER TABLE `tool_permissions`
  ADD CONSTRAINT `tool_permissions_toolId_fkey` FOREIGN KEY (`toolId`) REFERENCES `tools` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
