import { useCallback } from "react";
import { useToast } from "./Toast";
import { useIntl } from "react-intl";
import { useMutation, useQuery } from "@apollo/client";
import gql from "graphql-tag";

// GraphQL queries
const ALL_PLAYLISTS_QUERY = gql`
  query AllPlaylists {
    allPlaylists {
      id
      name
      description
      is_default
      scene_count
      front_image_path
    }
  }
`;

const DEFAULT_PLAYLIST_QUERY = gql`
  query DefaultPlaylist {
    defaultPlaylist {
      id
      name
      description
      is_default
      scene_count
      front_image_path
    }
  }
`;

const PLAYLIST_ENTRIES_QUERY = gql`
  query PlaylistEntries($playlist_id: ID!) {
    playlistEntries(playlist_id: $playlist_id) {
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

const PLAYLISTS_WITH_SCENE_QUERY = gql`
  query PlaylistsWithScene($scene_id: ID!) {
    playlistsWithScene(scene_id: $scene_id) {
      id
      name
      is_default
    }
  }
`;

// GraphQL mutations
const PLAYLIST_CREATE = gql`
  mutation PlaylistCreate($input: PlaylistCreateInput!) {
    playlistCreate(input: $input) {
      id
      name
      description
      is_default
      scene_count
    }
  }
`;

const PLAYLIST_UPDATE = gql`
  mutation PlaylistUpdate($input: PlaylistUpdateInput!) {
    playlistUpdate(input: $input) {
      id
      name
      description
    }
  }
`;

const PLAYLIST_DESTROY = gql`
  mutation PlaylistDestroy($id: ID!) {
    playlistDestroy(id: $id)
  }
`;

const PLAYLIST_ADD_SCENES = gql`
  mutation PlaylistAddScenes($input: PlaylistAddScenesInput!) {
    playlistAddScenes(input: $input)
  }
`;

const PLAYLIST_REMOVE_SCENE = gql`
  mutation PlaylistRemoveScene($input: PlaylistRemoveSceneInput!) {
    playlistRemoveScene(input: $input)
  }
`;

const PLAYLIST_REORDER_SCENE = gql`
  mutation PlaylistReorderScene($input: PlaylistReorderSceneInput!) {
    playlistReorderScene(input: $input)
  }
`;

const PLAYLIST_CLEAR_SCENES = gql`
  mutation PlaylistClearScenes($playlist_id: ID!) {
    playlistClearScenes(playlist_id: $playlist_id)
  }
`;

const PLAYLIST_SET_DEFAULT = gql`
  mutation PlaylistSetDefault($id: ID!) {
    playlistSetDefault(id: $id) {
      id
      name
      is_default
    }
  }
`;

export interface PlaylistData {
  id: string;
  name: string;
  description?: string;
  is_default: boolean;
  scene_count: number;
  front_image_path?: string;
}

export interface PlaylistEntryScene {
  id: string;
  title?: string;
  date?: string;
  paths: {
    screenshot?: string;
  };
  performers: Array<{
    id: string;
    name: string;
  }>;
  studio?: {
    id: string;
    name: string;
  };
}

export interface PlaylistEntry {
  position: number;
  scene: PlaylistEntryScene;
}

// Hook for getting all playlists
export const usePlaylists = () => {
  const { data, loading, error, refetch } = useQuery(ALL_PLAYLISTS_QUERY);

  return {
    playlists: (data?.allPlaylists ?? []) as PlaylistData[],
    loading,
    error,
    refetch,
  };
};

// Hook for getting the default playlist
export const useDefaultPlaylist = () => {
  const { data, loading, error, refetch } = useQuery(DEFAULT_PLAYLIST_QUERY);

  return {
    defaultPlaylist: data?.defaultPlaylist as PlaylistData | undefined,
    loading,
    error,
    refetch,
  };
};

// Hook for getting playlist entries
export const usePlaylistEntries = (playlistId: string) => {
  const { data, loading, error, refetch } = useQuery(PLAYLIST_ENTRIES_QUERY, {
    variables: { playlist_id: playlistId },
    skip: !playlistId,
  });

  return {
    entries: (data?.playlistEntries ?? []) as PlaylistEntry[],
    loading,
    error,
    refetch,
  };
};

// Hook for getting playlists containing a scene
export const usePlaylistsWithScene = (sceneId: string) => {
  const { data, loading, error, refetch } = useQuery(PLAYLISTS_WITH_SCENE_QUERY, {
    variables: { scene_id: sceneId },
    skip: !sceneId,
  });

  return {
    playlists: (data?.playlistsWithScene ?? []) as Array<{
      id: string;
      name: string;
      is_default: boolean;
    }>,
    loading,
    error,
    refetch,
  };
};

// Hook for playlist mutations
export const usePlaylistMutations = () => {
  const Toast = useToast();
  const intl = useIntl();

  const [createMutation] = useMutation(PLAYLIST_CREATE);
  const [updateMutation] = useMutation(PLAYLIST_UPDATE);
  const [destroyMutation] = useMutation(PLAYLIST_DESTROY);
  const [addScenesMutation] = useMutation(PLAYLIST_ADD_SCENES);
  const [removeSceneMutation] = useMutation(PLAYLIST_REMOVE_SCENE);
  const [reorderSceneMutation] = useMutation(PLAYLIST_REORDER_SCENE);
  const [clearScenesMutation] = useMutation(PLAYLIST_CLEAR_SCENES);
  const [setDefaultMutation] = useMutation(PLAYLIST_SET_DEFAULT);

  const createPlaylist = useCallback(
    async (name: string, description?: string) => {
      try {
        const result = await createMutation({
          variables: { input: { name, description } },
          refetchQueries: [{ query: ALL_PLAYLISTS_QUERY }],
        });
        Toast.success(
          intl.formatMessage(
            { id: "toast.created_entity" },
            { entity: intl.formatMessage({ id: "playlist" }).toLocaleLowerCase() }
          )
        );
        return result.data?.playlistCreate;
      } catch (error) {
        Toast.error(error);
        throw error;
      }
    },
    [createMutation, Toast, intl]
  );

  const updatePlaylist = useCallback(
    async (id: string, name?: string, description?: string) => {
      try {
        const result = await updateMutation({
          variables: { input: { id, name, description } },
          refetchQueries: [{ query: ALL_PLAYLISTS_QUERY }],
        });
        Toast.success(
          intl.formatMessage(
            { id: "toast.updated_entity" },
            { entity: intl.formatMessage({ id: "playlist" }).toLocaleLowerCase() }
          )
        );
        return result.data?.playlistUpdate;
      } catch (error) {
        Toast.error(error);
        throw error;
      }
    },
    [updateMutation, Toast, intl]
  );

  const deletePlaylist = useCallback(
    async (id: string) => {
      try {
        await destroyMutation({
          variables: { id },
          refetchQueries: [{ query: ALL_PLAYLISTS_QUERY }],
        });
        Toast.success(
          intl.formatMessage(
            { id: "toast.deleted_entity" },
            { entity: intl.formatMessage({ id: "playlist" }).toLocaleLowerCase() }
          )
        );
      } catch (error) {
        Toast.error(error);
        throw error;
      }
    },
    [destroyMutation, Toast, intl]
  );

  const addScenesToPlaylist = useCallback(
    async (playlistId: string, sceneIds: string[]) => {
      try {
        await addScenesMutation({
          variables: { input: { playlist_id: playlistId, scene_ids: sceneIds } },
        });
        Toast.success(
          intl.formatMessage(
            { id: "toast.added_entity" },
            { entity: intl.formatMessage({ id: "scene" }).toLocaleLowerCase() }
          )
        );
      } catch (error) {
        Toast.error(error);
        throw error;
      }
    },
    [addScenesMutation, Toast, intl]
  );

  const removeSceneFromPlaylist = useCallback(
    async (playlistId: string, sceneId: string) => {
      try {
        await removeSceneMutation({
          variables: { input: { playlist_id: playlistId, scene_id: sceneId } },
        });
      } catch (error) {
        Toast.error(error);
        throw error;
      }
    },
    [removeSceneMutation, Toast]
  );

  const reorderSceneInPlaylist = useCallback(
    async (playlistId: string, sceneId: string, position: number) => {
      try {
        await reorderSceneMutation({
          variables: { input: { playlist_id: playlistId, scene_id: sceneId, position } },
        });
      } catch (error) {
        Toast.error(error);
        throw error;
      }
    },
    [reorderSceneMutation, Toast]
  );

  const clearPlaylist = useCallback(
    async (playlistId: string) => {
      try {
        await clearScenesMutation({
          variables: { playlist_id: playlistId },
        });
        Toast.success(intl.formatMessage({ id: "toast.playlist_cleared" }));
      } catch (error) {
        Toast.error(error);
        throw error;
      }
    },
    [clearScenesMutation, Toast, intl]
  );

  const setDefaultPlaylist = useCallback(
    async (id: string) => {
      try {
        await setDefaultMutation({
          variables: { id },
          refetchQueries: [
            { query: ALL_PLAYLISTS_QUERY },
            { query: DEFAULT_PLAYLIST_QUERY },
          ],
        });
        Toast.success(intl.formatMessage({ id: "toast.default_playlist_set" }));
      } catch (error) {
        Toast.error(error);
        throw error;
      }
    },
    [setDefaultMutation, Toast, intl]
  );

  return {
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addScenesToPlaylist,
    removeSceneFromPlaylist,
    reorderSceneInPlaylist,
    clearPlaylist,
    setDefaultPlaylist,
  };
};
