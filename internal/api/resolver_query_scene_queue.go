package api

import (
	"context"
	"time"

	"github.com/stashapp/stash/pkg/models"
)

// SceneQueueEntry is the struct for scene queue entries (backwards compatibility)
type SceneQueueEntry struct {
	Scene     *models.Scene
	Position  int
	CreatedAt time.Time
}

// SceneQueueEntry resolver methods
func (r *sceneQueueEntryResolver) Scene(ctx context.Context, obj *SceneQueueEntry) (*models.Scene, error) {
	return obj.Scene, nil
}

func (r *sceneQueueEntryResolver) CreatedAt(ctx context.Context, obj *SceneQueueEntry) (*time.Time, error) {
	return &obj.CreatedAt, nil
}

// SceneQueue returns entries from the default playlist (backwards compatibility)
func (r *queryResolver) SceneQueue(ctx context.Context) ([]*SceneQueueEntry, error) {
	var entries []*SceneQueueEntry

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		// Get the default playlist
		defaultPlaylist, err := r.repository.Playlist.FindDefault(ctx)
		if err != nil {
			return err
		}

		// Get scene IDs from the default playlist
		sceneIDs, err := r.repository.Playlist.GetSceneIDs(ctx, defaultPlaylist.ID)
		if err != nil {
			return err
		}

		// Fetch scenes for each ID
		for idx, sceneID := range sceneIDs {
			scene, err := r.repository.Scene.Find(ctx, sceneID)
			if err != nil {
				return err
			}

			if scene != nil {
				entries = append(entries, &SceneQueueEntry{
					Scene:     scene,
					Position:  idx,
					CreatedAt: time.Now(), // Use current time for backwards compat
				})
			}
		}

		return nil
	}); err != nil {
		return nil, err
	}

	return entries, nil
}
