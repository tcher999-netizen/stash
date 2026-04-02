import React, { useEffect, useRef, useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { FormattedMessage, useIntl } from "react-intl";

import * as GQL from "src/core/generated-graphql";
import { ModalComponent } from "src/components/Shared/Modal";
import { LoadingIndicator } from "src/components/Shared/LoadingIndicator";
import { stashboxDisplayName } from "src/utils/stashbox";
import { useDebounce } from "src/hooks/debounce";

const CLASSNAME = "StudioScrapeModal";
const CLASSNAME_LIST = `${CLASSNAME}-list`;
const CLASSNAME_LIST_CONTAINER = `${CLASSNAME_LIST}-container`;

interface IStudioSearchResultDetailsProps {
  studio: GQL.ScrapedStudio;
}

const StudioSearchResultDetails: React.FC<IStudioSearchResultDetailsProps> = ({
  studio,
}) => {
  function renderImage() {
    if (studio.image) {
      return (
        <div className="scene-image-container">
          <img
            src={studio.image}
            alt=""
            className="align-self-center scene-image"
          />
        </div>
      );
    }
  }

  function renderParent() {
    if (studio.parent?.name) {
      return (
        <span className="studio-parent">
          <FormattedMessage id="parent_studio" />: {studio.parent.name}
        </span>
      );
    }
  }

  function renderUrl() {
    if (studio.urls && studio.urls.length > 0) {
      return <span className="studio-url">{studio.urls[0]}</span>;
    }
  }

  return (
    <div className="studio-result">
      <Row>
        {renderImage()}
        <div className="col flex-column">
          <h4 className="studio-name">
            <span>{studio.name}</span>
          </h4>
          <div className="studio-details">
            {renderParent()}
            {renderUrl()}
          </div>
        </div>
      </Row>
    </div>
  );
};

export interface IStudioSearchResult {
  studio: GQL.ScrapedStudio;
}

export const StudioSearchResult: React.FC<IStudioSearchResult> = ({
  studio,
}) => {
  return (
    <div className="mt-3 search-item">
      <StudioSearchResultDetails studio={studio} />
    </div>
  );
};

export interface IStashBox extends GQL.StashBox {
  index: number;
}

interface IProps {
  instance: IStashBox;
  onHide: () => void;
  onSelectStudio: (studio: GQL.ScrapedStudio) => void;
  name?: string;
}

const StudioStashBoxModal: React.FC<IProps> = ({
  instance,
  name,
  onHide,
  onSelectStudio,
}) => {
  const intl = useIntl();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState<string>(name ?? "");
  const { data, loading } = GQL.useScrapeSingleStudioQuery({
    variables: {
      source: {
        stash_box_endpoint: instance.endpoint,
      },
      input: {
        query,
      },
    },
    skip: query === "",
  });

  const studios = data?.scrapeSingleStudio ?? [];

  const onInputChange = useDebounce(setQuery, 500);

  useEffect(() => inputRef.current?.focus(), []);

  function renderResults() {
    if (!studios) {
      return;
    }

    return (
      <div className={CLASSNAME_LIST_CONTAINER}>
        <div className="mt-1">
          <FormattedMessage
            id="dialogs.studios_found"
            values={{ count: studios.length }}
          />
        </div>
        <ul className={CLASSNAME_LIST}>
          {studios.map((s, i) => (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, react/no-array-index-key
            <li key={i} onClick={() => onSelectStudio(s)}>
              <StudioSearchResult studio={s} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <ModalComponent
      show
      onHide={onHide}
      header={`Scrape studio from ${stashboxDisplayName(
        instance.name,
        instance.index
      )}`}
      accept={{
        text: intl.formatMessage({ id: "actions.cancel" }),
        onClick: onHide,
        variant: "secondary",
      }}
    >
      <div className={CLASSNAME}>
        <Form.Control
          onChange={(e) => onInputChange(e.currentTarget.value)}
          defaultValue={name ?? ""}
          placeholder="Studio name..."
          className="text-input mb-4"
          ref={inputRef}
        />
        {loading ? (
          <div className="m-4 text-center">
            <LoadingIndicator inline />
          </div>
        ) : studios.length > 0 ? (
          renderResults()
        ) : (
          query !== "" && <h5 className="text-center">No results found.</h5>
        )}
      </div>
    </ModalComponent>
  );
};

export default StudioStashBoxModal;
