-- Initialize Todo database schema
USE todoDb;

-- Create todo table if it doesn't exist
CREATE TABLE IF NOT EXISTS `todo` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `title` varchar(256) NOT NULL,
  `emphasized` boolean DEFAULT false,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_emphasized (emphasized),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Grant permissions to app user
GRANT ALL PRIVILEGES ON todoDb.* TO 'appuser'@'%';
FLUSH PRIVILEGES;
