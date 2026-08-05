-- ============================================================
-- Task Management System - Database Schema (MySQL)
-- ============================================================

CREATE DATABASE IF NOT EXISTS task_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE task_management;

-- ------------------------------------------------------------
-- Table: users
-- Menyimpan data akun pengguna
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id        INT          AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(100) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,           -- bcrypt hash
  created_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Table: tasks
-- Menyimpan task milik setiap pengguna
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  status      ENUM('pending', 'in-progress', 'done') DEFAULT 'pending',
  deadline    DATE,
  user_id     INT          NOT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index untuk mempercepat query filter per user
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status  ON tasks (status);
