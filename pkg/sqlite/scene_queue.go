package sqlite

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/doug-martin/goqu/v9"
	"github.com/jmoiron/sqlx"
)

const sceneQueueTable = "scene_queue"

type SceneQueueStore struct {
	repository
}

func (qb *SceneQueueStore) Get(ctx context.Context) ([]int, error) {
	table := goqu.T(sceneQueueTable)
	q := dialect.From(table).Select(table.Col("scene_id")).Order(table.Col("position").Asc())

	const single = false
	var ret []int
	if err := queryFunc(ctx, q, single, func(rows *sqlx.Rows) error {
		var sceneID int
		if err := rows.Scan(&sceneID); err != nil {
			return err
		}
		ret = append(ret, sceneID)
		return nil
	}); err != nil {
		return nil, err
	}

	return ret, nil
}

func (qb *SceneQueueStore) Add(ctx context.Context, sceneID int) error {
	table := goqu.T(sceneQueueTable)

	// Get the max position
	maxPosQuery := dialect.From(table).Select(goqu.MAX(table.Col("position")))
	
	var maxPos sql.NullInt64
	if err := querySimple(ctx, maxPosQuery, &maxPos); err != nil && !errors.Is(err, sql.ErrNoRows) {
		return fmt.Errorf("getting max position: %w", err)
	}

	newPos := 0
	if maxPos.Valid {
		newPos = int(maxPos.Int64) + 1
	}

	// Insert the scene at the end
	q := dialect.Insert(table).Rows(
		goqu.Record{
			"scene_id": sceneID,
			"position": newPos,
		},
	).OnConflict(goqu.DoNothing())

	if _, err := exec(ctx, q); err != nil {
		return fmt.Errorf("adding scene to queue: %w", err)
	}

	return nil
}

func (qb *SceneQueueStore) Remove(ctx context.Context, sceneID int) error {
	table := goqu.T(sceneQueueTable)

	// Get the position of the scene being removed
	var removedPos int
	posQuery := dialect.From(table).Select(table.Col("position")).Where(table.Col("scene_id").Eq(sceneID))
	if err := querySimple(ctx, posQuery, &removedPos); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// Scene not in queue, nothing to do
			return nil
		}
		return fmt.Errorf("getting scene position: %w", err)
	}

	// Delete the scene
	deleteQ := dialect.Delete(table).Where(table.Col("scene_id").Eq(sceneID))
	if _, err := exec(ctx, deleteQ); err != nil {
		return fmt.Errorf("removing scene from queue: %w", err)
	}

	// Update positions of scenes after the removed one
	updateQ := dialect.Update(table).
		Set(goqu.Record{"position": goqu.L("position - 1")}).
		Where(table.Col("position").Gt(removedPos))

	if _, err := exec(ctx, updateQ); err != nil {
		return fmt.Errorf("updating queue positions: %w", err)
	}

	return nil
}

func (qb *SceneQueueStore) Reorder(ctx context.Context, sceneID int, newPosition int) error {
	table := goqu.T(sceneQueueTable)

	// Get current position
	var currentPos int
	posQuery := dialect.From(table).Select(table.Col("position")).Where(table.Col("scene_id").Eq(sceneID))
	if err := querySimple(ctx, posQuery, &currentPos); err != nil {
		return fmt.Errorf("getting current position: %w", err)
	}

	if currentPos == newPosition {
		return nil // No change needed
	}

	// Update positions of other scenes
	if newPosition < currentPos {
		// Moving up: increment positions between new and current
		updateQ := dialect.Update(table).
			Set(goqu.Record{"position": goqu.L("position + 1")}).
			Where(
				table.Col("position").Gte(newPosition),
				table.Col("position").Lt(currentPos),
			)
		if _, err := exec(ctx, updateQ); err != nil {
			return fmt.Errorf("updating queue positions: %w", err)
		}
	} else {
		// Moving down: decrement positions between current and new
		updateQ := dialect.Update(table).
			Set(goqu.Record{"position": goqu.L("position - 1")}).
			Where(
				table.Col("position").Gt(currentPos),
				table.Col("position").Lte(newPosition),
			)
		if _, err := exec(ctx, updateQ); err != nil {
			return fmt.Errorf("updating queue positions: %w", err)
		}
	}

	// Update the scene's position
	updateSceneQ := dialect.Update(table).
		Set(goqu.Record{"position": newPosition}).
		Where(table.Col("scene_id").Eq(sceneID))

	if _, err := exec(ctx, updateSceneQ); err != nil {
		return fmt.Errorf("updating scene position: %w", err)
	}

	return nil
}

func (qb *SceneQueueStore) Clear(ctx context.Context) error {
	table := goqu.T(sceneQueueTable)

	q := dialect.Delete(table)
	if _, err := exec(ctx, q); err != nil {
		return fmt.Errorf("clearing queue: %w", err)
	}

	return nil
}
