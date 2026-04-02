import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import * as GQL from "src/core/generated-graphql";
import { ModalComponent } from "src/components/Shared/Modal";
import { mutateStashBoxBatchStudioTag } from "src/core/StashService";
import { useConfigurationContext } from "src/hooks/Config";
import { useToast } from "src/hooks/Toast";
import { stashboxDisplayName } from "src/utils/stashbox";

interface IStudioIdentifyDialogProps {
  selectedIds: string[];
  onClose: () => void;
}

export const StudioIdentifyDialog: React.FC<IStudioIdentifyDialogProps> = ({
  selectedIds,
  onClose,
}) => {
  const intl = useIntl();
  const Toast = useToast();
  const { configuration: stashConfig } = useConfigurationContext();

  const stashBoxes = stashConfig?.general.stashBoxes ?? [];

  const [selectedEndpoint, setSelectedEndpoint] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [createParent, setCreateParent] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  if (stashBoxes.length === 0) {
    return (
      <ModalComponent
        show
        icon={faTags}
        header={intl.formatMessage({ id: "actions.identify" })}
        accept={{
          text: intl.formatMessage({ id: "actions.close" }),
          onClick: onClose,
        }}
      >
        <p>
          <FormattedMessage id="studio_tagger.to_use_the_studio_tagger" />
        </p>
      </ModalComponent>
    );
  }

  async function onIdentify() {
    setIsRunning(true);
    try {
      await mutateStashBoxBatchStudioTag({
        ids: selectedIds,
        endpoint: selectedEndpoint,
        refresh,
        exclude_fields: [],
        createParent,
      });
      Toast.success(
        intl.formatMessage(
          { id: "toast.started_job" },
          { operation: intl.formatMessage({ id: "actions.identify" }) }
        )
      );
      onClose();
    } catch (e) {
      Toast.error(e);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <ModalComponent
      show
      icon={faTags}
      header={intl.formatMessage({ id: "actions.identify" })}
      accept={{
        text: intl.formatMessage({ id: "actions.identify" }),
        onClick: onIdentify,
      }}
      cancel={{
        text: intl.formatMessage({ id: "actions.cancel" }),
        variant: "secondary",
        onClick: onClose,
      }}
      disabled={isRunning}
    >
      <Form.Group>
        <Form.Label>
          <FormattedMessage id="stashbox.source" />
        </Form.Label>
        <Form.Control
          as="select"
          value={selectedEndpoint}
          onChange={(e) => setSelectedEndpoint(Number(e.target.value))}
          className="input-control"
        >
          {stashBoxes.map((box, index) => (
            <option key={box.endpoint} value={index}>
              {stashboxDisplayName(box.name, index)}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group>
        <Form.Check
          id="refresh-tagged"
          checked={refresh}
          label={intl.formatMessage({
            id: "studio_tagger.refresh_tagged_studios",
          })}
          onChange={() => setRefresh(!refresh)}
        />
        <Form.Text muted>
          <FormattedMessage id="studio_tagger.refreshing_will_update_the_data" />
        </Form.Text>
      </Form.Group>

      <Form.Group>
        <Form.Check
          id="create-parent"
          checked={createParent}
          label={intl.formatMessage({
            id: "studio_tagger.create_or_tag_parent_studios",
          })}
          onChange={() => setCreateParent(!createParent)}
        />
      </Form.Group>

      <p className="mt-3">
        <FormattedMessage
          id="studio_tagger.number_of_studios_will_be_processed"
          values={{ studio_count: selectedIds.length }}
        />
      </p>
    </ModalComponent>
  );
};
