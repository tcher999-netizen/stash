import React, { useState, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { Button } from "react-bootstrap";
import { faUndoAlt } from "@fortawesome/free-solid-svg-icons";
import { Icon } from "../../Shared/Icon";
import { FilteredSceneList } from "../../Scenes/SceneList";
import { View } from "../../List/views";
import { makeFindScenesWithIds } from "src/core/StashService";
import { DisplayMode } from "src/models/list-filter/types";
import { PlaylistEntry } from "src/hooks/usePlaylist";

interface IProps {
  playlistId: string;
  entries: PlaylistEntry[];
}

export const PlaylistScenesPanel: React.FC<IProps> = ({
  playlistId,
  entries,
}) => {
  const [resetKey, setResetKey] = useState(0);

  const sceneIds = useMemo(() => entries.map((e) => e.scene.id), [entries]);

  const useFindScenesScoped = useMemo(
    () => makeFindScenesWithIds(sceneIds),
    [sceneIds]
  );

  if (entries.length === 0) {
    return (
      <div className="text-center text-muted py-5">
        <FormattedMessage id="playlist.empty" />
      </div>
    );
  }

  return (
    <div className="playlist-scenes-panel">
      <div className="d-flex justify-content-end mb-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setResetKey((k) => k + 1)}
        >
          <Icon icon={faUndoAlt} className="mr-2" />
          <FormattedMessage
            id="playlist.reset_filters"
            defaultMessage="Reset Filters"
          />
        </Button>
      </div>
      <FilteredSceneList
        key={resetKey}
        defaultSort=""
        defaultDisplayMode={DisplayMode.List}
        alterQuery={false}
        view={View.PlaylistScenes}
        useFindScenesOverride={useFindScenesScoped}
      />
    </div>
  );
};
