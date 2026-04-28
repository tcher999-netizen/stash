-- Create playlists table
CREATE TABLE IF NOT EXISTS `playlists` (
  `id` integer primary key autoincrement not null,
  `name` varchar(255) not null,
  `description` text,
  `is_default` boolean not null default 0,
  `created_at` datetime not null default CURRENT_TIMESTAMP,
  `updated_at` datetime not null default CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS `index_playlists_name` ON `playlists` (`name`);

-- Create playlist_entries table
CREATE TABLE IF NOT EXISTS `playlist_entries` (
  `playlist_id` integer not null,
  `scene_id` integer not null,
  `position` integer not null,
  `created_at` datetime not null default CURRENT_TIMESTAMP,
  `updated_at` datetime not null default CURRENT_TIMESTAMP,
  foreign key(`playlist_id`) references `playlists`(`id`) on delete CASCADE,
  foreign key(`scene_id`) references `scenes`(`id`) on delete CASCADE,
  PRIMARY KEY (`playlist_id`, `scene_id`)
);

CREATE INDEX IF NOT EXISTS `index_playlist_entries_position` ON `playlist_entries` (`playlist_id`, `position`);

-- Create default playlist
INSERT INTO `playlists` (`name`, `is_default`, `created_at`, `updated_at`)
SELECT 'Default Playlist', 1, datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM `playlists` WHERE `is_default` = 1);

-- Migrate existing scene_queue data to default playlist
INSERT INTO `playlist_entries` (`playlist_id`, `scene_id`, `position`, `created_at`, `updated_at`)
SELECT
  (SELECT `id` FROM `playlists` WHERE `is_default` = 1),
  `scene_id`, `position`, `created_at`, `updated_at`
FROM `scene_queue`
WHERE EXISTS (SELECT 1 FROM `scene_queue` LIMIT 1);

-- Drop old scene_queue table
DROP TABLE IF EXISTS `scene_queue`;
