-- Fix for skipped migrations 76/77 due to migration number collision.
-- When custom migrations (scene_queue, playlists) were renumbered from 76/77
-- to 86/87, the upstream migrations that took over 76/77 (studio_custom_fields,
-- tag_custom_fields) were never run because the DB was already past those versions.

CREATE TABLE IF NOT EXISTS `studio_custom_fields` (
  `studio_id` integer NOT NULL,
  `field` varchar(64) NOT NULL,
  `value` BLOB NOT NULL,
  PRIMARY KEY (`studio_id`, `field`),
  foreign key(`studio_id`) references `studios`(`id`) on delete CASCADE
);

CREATE INDEX IF NOT EXISTS `index_studio_custom_fields_field_value` ON `studio_custom_fields` (`field`, `value`);

CREATE TABLE IF NOT EXISTS `tag_custom_fields` (
  `tag_id` integer NOT NULL,
  `field` varchar(64) NOT NULL,
  `value` BLOB NOT NULL,
  PRIMARY KEY (`tag_id`, `field`),
  foreign key(`tag_id`) references `tags`(`id`) on delete CASCADE
);

CREATE INDEX IF NOT EXISTS `index_tag_custom_fields_field_value` ON `tag_custom_fields` (`field`, `value`);
