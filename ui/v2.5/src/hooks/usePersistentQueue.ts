import { useState, useEffect, useCallback } from "react";
import { QueuedScene } from "src/models/sceneQueue";
import { useToast } from "./Toast";
import { useIntl } from "react-intl";
import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";

const SCENE_QUEUE_QUERY = gql`
  query SceneQueue {
    sceneQueue {
      position
      scene {
        id
        title
        date
        paths {
          screenshot
        }
        performers {
          id
          name
        }
        studio {
          id
          name
        }
      }
    }
  }
`;

const SCENE_QUEUE_ADD = gql`
  mutation SceneQueueAdd($scene_id: ID!) {
    sceneQueueAdd(scene_id: $scene_id)
  }
`;

const SCENE_QUEUE_REMOVE = gql`
  mutation SceneQueueRemove($scene_id: ID!) {
    sceneQueueRemove(scene_id: $scene_id)
  }
`;

const SCENE_QUEUE_REORDER = gql`
  mutation SceneQueueReorder($scene_id: ID!, $position: Int!) {
    sceneQueueReorder(scene_id: $scene_id, position: $position)
  }
`;

const SCENE_QUEUE_CLEAR = gql`
  mutation SceneQueueClear {
    sceneQueueClear
  }
`;

export const usePersistentQueue = () => {
  const [queue, setQueue] = useState<QueuedScene[]>([]);
  const [loading, setLoading] = useState(true);
  const Toast = useToast();
  const intl = useIntl();

  const { data, refetch } = useQuery(SCENE_QUEUE_QUERY);
  const [addMutation] = useMutation(SCENE_QUEUE_ADD);
  const [removeMutation] = useMutation(SCENE_QUEUE_REMOVE);
  const [reorderMutation] = useMutation(SCENE_QUEUE_REORDER);
  const [clearMutation] = useMutation(SCENE_QUEUE_CLEAR);

  useEffect(() => {
    if (data?.sceneQueue) {
      const scenes = data.sceneQueue.map((entry: any) => entry.scene);
      setQueue(scenes);
      setLoading(false);
    }
  }, [data]);

  const addToQueue = useCallback(
    async (sceneId: string) => {
      try {
        await addMutation({ variables: { scene_id: sceneId } });
        await refetch();
        Toast.success(
          intl.formatMessage(
            { id: "toast.added_entity" },
            {
              entity: intl
                .formatMessage({ id: "scene" })
                .toLocaleLowerCase(),
            }
          )
        );
      } catch (error) {
        Toast.error(error);
      }
    },
    [addMutation, refetch, Toast, intl]
  );

  const removeFromQueue = useCallback(
    async (sceneId: string) => {
      try {
        await removeMutation({ variables: { scene_id: sceneId } });
        await refetch();
      } catch (error) {
        Toast.error(error);
      }
    },
    [removeMutation, refetch, Toast]
  );

  const clearQueue = useCallback(async () => {
    try {
      await clearMutation();
      await refetch();
      Toast.success(intl.formatMessage({ id: "toast.queue_cleared" }));
    } catch (error) {
      Toast.error(error);
    }
  }, [clearMutation, refetch, Toast, intl]);

  const reorderQueue = useCallback(
    async (fromIndex: number, toIndex: number) => {
      try {
        const sceneId = queue[fromIndex].id;
        await reorderMutation({
          variables: { scene_id: sceneId, position: toIndex },
        });
        await refetch();
      } catch (error) {
        Toast.error(error);
      }
    },
    [queue, reorderMutation, refetch, Toast]
  );

  const isInQueue = useCallback(
    (sceneId: string) => {
      return queue.some((scene) => scene.id === sceneId);
    },
    [queue]
  );

  return {
    queue,
    loading,
    addToQueue,
    removeFromQueue,
    clearQueue,
    reorderQueue,
    isInQueue,
  };
};
