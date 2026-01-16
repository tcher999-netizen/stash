# Persistent Scene Queue Implementation

## Overview
Implemented a server-side persistent viewing queue that syncs across all devices and browsers. The queue is stored in the Stash database and accessed via GraphQL.

## Backend Changes

### 1. Database Migration
**File:** `pkg/sqlite/migrations/75_scene_queue.up.sql`
- Creates `scene_queue` table with columns: `scene_id`, `position`, `created_at`, `updated_at`
- Adds index on `position` for efficient ordering
- CASCADE delete on scene deletion

### 2. Queue Repository
**File:** `pkg/sqlite/scene_queue.go`
- `SceneQueueStore` with methods:
  - `Get(ctx)` - Retrieve queue ordered by position
  - `Add(ctx, sceneID)` - Add scene to end of queue
  - `Remove(ctx, sceneID)` - Remove scene and reorder
  - `Reorder(ctx, sceneID, position)` - Move scene to new position
  - `Clear(ctx)` - Empty the queue

### 3. Models
**File:** `pkg/models/model_scene_queue.go`
- Defined `SceneQueueReader`, `SceneQueueWriter`, `SceneQueueReaderWriter` interfaces

**File:** `pkg/models/repository.go`
- Added `SceneQueue` to `Repository` struct

### 4. Database Integration
**File:** `pkg/sqlite/database.go`
- Updated schema version to 75
- Added `SceneQueue` to `storeRepository`
- Initialized `SceneQueueStore` in `NewDatabase()`

**File:** `pkg/sqlite/transaction.go`
- Added `SceneQueue` to `Repository()` method

### 5. GraphQL Schema
**File:** `graphql/schema/types/scene-queue.graphql`
- Defined `SceneQueueEntry` type
- Added query: `sceneQueue`
- Added mutations:
  - `sceneQueueAdd(scene_id: ID!)`
  - `sceneQueueRemove(scene_id: ID!)`
  - `sceneQueueReorder(scene_id: ID!, position: Int!)`
  - `sceneQueueClear`

### 6. GraphQL Resolvers
**File:** `internal/api/resolver_query_scene_queue.go`
- Query resolver for fetching the queue

**File:** `internal/api/resolver_mutation_scene_queue.go`
- Mutation resolvers for add, remove, reorder, clear

## Frontend Changes

### 1. GraphQL Operations
**File:** `ui/v2.5/graphql/queries/scene-queue.graphql`
- Query for fetching queue

**File:** `ui/v2.5/graphql/mutations/scene-queue.graphql`
- Mutations for queue operations

### 2. Hooks
**File:** `ui/v2.5/src/hooks/usePersistentQueue.ts`
- Updated to use GraphQL mutations/queries instead of localForage
- Provides: `addToQueue`, `removeFromQueue`, `clearQueue`, `reorderQueue`, `isInQueue`

### 3. Components
**Files already created:**
- `ui/v2.5/src/components/Queue/QueuePage.tsx` - Standalone queue page
- `ui/v2.5/src/components/Scenes/SceneCardEnhanced.tsx` - Queue button component
- `ui/v2.5/src/components/Scenes/SceneDetails/PersistentQueueViewer.tsx` - Queue viewer with drag-and-drop
- `ui/v2.5/src/components/Queue/Queue.scss` - Queue styling

### 4. Scene Integration
**File:** `ui/v2.5/src/components/Scenes/SceneDetails/Scene.tsx`
- Integrated persistent queue with scene playback
- Auto-removal of scenes after watching
- Queue tab shows persistent queue when viewing from queue

### 5. Navigation
**File:** `ui/v2.5/src/components/MainNavbar.tsx`
- Added Queue menu item with hotkey `g q`

**File:** `ui/v2.5/src/App.tsx`
- Added `/queue` route

## Features

✅ **Server-Side Storage** - Queue stored in database, not browser
✅ **Cross-Device Sync** - Access same queue from any device/browser
✅ **Persistent** - Survives browser cache clears and restarts
✅ **Drag-and-Drop Reordering** - Reorder scenes in the queue
✅ **Fresh Scene Data** - Scene titles/metadata always up-to-date
✅ **Auto-Removal** - Scenes removed from queue after watching
✅ **Navigation Integration** - Queue link in main nav with hotkey
✅ **Scene Card Integration** - Add/remove from queue on any scene card

## Migration from Browser Storage

When users first load the app after this update:
- Their existing browser-based queue (if any) will still exist in localForage
- New queue operations will use the server-side database
- The browser queue can be manually migrated by re-adding scenes to the new queue

## Future Enhancements

Possible improvements:
- Migration script to auto-migrate browser queues to server on first load
- Multiple named queues/playlists
- Queue sharing between users
- "Continue watching" suggestions based on queue history
- Queue analytics and statistics

## Testing

To test the implementation:
1. Rebuild Docker image with these changes
2. Navigate to any scene listing page
3. Click the queue button on scene cards to add scenes
4. Navigate to `/queue` or click Queue in navigation
5. Drag scenes to reorder
6. Click Play Queue to start watching
7. Scenes auto-remove after completion
8. Verify queue persists across browser restarts
9. Test from different browsers/devices to confirm sync

## Database Schema

```sql
CREATE TABLE `scene_queue` (
  `scene_id` integer not null,
  `position` integer not null,
  `created_at` datetime not null default CURRENT_TIMESTAMP,
  `updated_at` datetime not null default CURRENT_TIMESTAMP,
  foreign key(`scene_id`) references `scenes`(`id`) on delete CASCADE,
  PRIMARY KEY (`scene_id`)
);

CREATE INDEX `index_scene_queue_position` ON `scene_queue` (`position`);
```

## API Examples

### Add to Queue
```graphql
mutation {
  sceneQueueAdd(scene_id: "123")
}
```

### Get Queue
```graphql
query {
  sceneQueue {
    position
    scene {
      id
      title
      paths {
        screenshot
      }
    }
  }
}
```

### Reorder
```graphql
mutation {
  sceneQueueReorder(scene_id: "123", position: 0)
}
```

### Clear Queue
```graphql
mutation {
  sceneQueueClear
}
```
