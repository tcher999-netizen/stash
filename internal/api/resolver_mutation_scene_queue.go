package api

import (
	"context"
	"fmt"
	"strconv"
)

func (r *mutationResolver) SceneQueueAdd(ctx context.Context, sceneID string) (bool, error) {
	id, err := strconv.Atoi(sceneID)
	if err != nil {
		return false, fmt.Errorf("converting scene id: %w", err)
	}

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		// Verify scene exists
		scene, err := r.repository.Scene.Find(ctx, id)
		if err != nil {
			return err
		}
		if scene == nil {
			return fmt.Errorf("scene with id %d not found", id)
		}

		return r.repository.SceneQueue.Add(ctx, id)
	}); err != nil {
		return false, err
	}

	return true, nil
}

func (r *mutationResolver) SceneQueueRemove(ctx context.Context, sceneID string) (bool, error) {
	id, err := strconv.Atoi(sceneID)
	if err != nil {
		return false, fmt.Errorf("converting scene id: %w", err)
	}

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		return r.repository.SceneQueue.Remove(ctx, id)
	}); err != nil {
		return false, err
	}

	return true, nil
}

func (r *mutationResolver) SceneQueueReorder(ctx context.Context, sceneID string, position int) (bool, error) {
	id, err := strconv.Atoi(sceneID)
	if err != nil {
		return false, fmt.Errorf("converting scene id: %w", err)
	}

	if err := r.withTxn(ctx, func(ctx context.Context) error {
		return r.repository.SceneQueue.Reorder(ctx, id, position)
	}); err != nil {
		return false, err
	}

	return true, nil
}

func (r *mutationResolver) SceneQueueClear(ctx context.Context) (bool, error) {
	if err := r.withTxn(ctx, func(ctx context.Context) error {
		return r.repository.SceneQueue.Clear(ctx)
	}); err != nil {
		return false, err
	}

	return true, nil
}
