CREATE TABLE `scene_queue` (
  `scene_id` integer not null,
  `position` integer not null,
  `created_at` datetime not null default CURRENT_TIMESTAMP,
  `updated_at` datetime not null default CURRENT_TIMESTAMP,
  foreign key(`scene_id`) references `scenes`(`id`) on delete CASCADE,
  PRIMARY KEY (`scene_id`)
);

CREATE INDEX `index_scene_queue_position` ON `scene_queue` (`position`);
