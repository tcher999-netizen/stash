-- Recreate scene_queue table
CREATE TABLE IF NOT EXISTS `scene_queue` (
  `scene_id` integer not null,
  `position` integer not null,
  `created_at` datetime not null default CURRENT_TIMESTAMP,
  `updated_at` datetime not null default CURRENT_TIMESTAMP,
  foreign key(`scene_id`) references `scenes`(`id`) on delete CASCADE,
  PRIMARY KEY (`scene_id`)
);

CREATE INDEX IF NOT EXISTS `index_scene_queue_position` ON `scene_queue` (`position`);

-- Migrate data back from default playlist
INSERT INTO `scene_queue` (`scene_id`, `position`, `created_at`, `updated_at`)
SELECT `scene_id`, `position`, `created_at`, `updated_at`
FROM `playlist_entries`
WHERE `playlist_id` = (SELECT `id` FROM `playlists` WHERE `is_default` = 1);

-- Drop playlist tables
DROP TABLE IF EXISTS `playlist_entries`;
DROP TABLE IF EXISTS `playlists`;
