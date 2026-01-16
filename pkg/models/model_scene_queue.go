package models

import "context"

type SceneQueueReader interface {
	Get(ctx context.Context) ([]int, error)
}

type SceneQueueWriter interface {
	Add(ctx context.Context, sceneID int) error
	Remove(ctx context.Context, sceneID int) error
	Reorder(ctx context.Context, sceneID int, position int) error
	Clear(ctx context.Context) error
}

type SceneQueueReaderWriter interface {
	SceneQueueReader
	SceneQueueWriter
}
