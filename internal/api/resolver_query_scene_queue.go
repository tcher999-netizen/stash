package api

import (
	"context"
)

func (r *queryResolver) SceneQueue(ctx context.Context) ([]*SceneQueueEntry, error) {
	var entries []*SceneQueueEntry

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		sceneIDs, err := r.repository.SceneQueue.Get(ctx)
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
					Scene:    scene,
					Position: idx,
				})
			}
		}

		return nil
	}); err != nil {
		return nil, err
	}

	return entries, nil
}
