import React, { useState } from "react";
import { useIntl } from "react-intl";
import * as GQL from "src/core/generated-graphql";
import {
  ScrapedInputGroupRow,
  ScrapedImageRow,
  ScrapedTextAreaRow,
  ScrapedStringListRow,
} from "src/components/Shared/ScrapeDialog/ScrapeDialogRow";
import { ScrapeDialog } from "src/components/Shared/ScrapeDialog/ScrapeDialog";
import { IStashBox } from "./StudioStashBoxModal";
import {
  ObjectScrapeResult,
  ScrapeResult,
} from "src/components/Shared/ScrapeDialog/scrapeResult";
import { Tag } from "src/components/Tags/TagSelect";
import { uniq } from "lodash-es";
import { useScrapedTags } from "src/components/Shared/ScrapeDialog/scrapedTags";
import { ScrapedStudioRow } from "src/components/Shared/ScrapeDialog/ScrapedObjectsRow";
import { useCreateScrapedStudio } from "src/components/Shared/ScrapeDialog/createObjects";
import { Studio } from "../../StudioSelect";

interface IStudioScrapeDialogProps {
  studio: Partial<GQL.StudioUpdateInput>;
  studioTags: Tag[];
  parentStudio: Studio | null;
  scraped: GQL.ScrapedStudio;
  scraper: IStashBox;
  onClose: (scrapedStudio?: GQL.ScrapedStudio) => void;
}

export const StudioScrapeDialog: React.FC<IStudioScrapeDialogProps> = (
  props: IStudioScrapeDialogProps
) => {
  const intl = useIntl();

  const endpoint = props.scraper.endpoint;

  function getCurrentRemoteSiteID() {
    if (!endpoint) {
      return;
    }

    const stashIDs = (props.studio.stash_ids ?? []).filter(
      (s) => s.endpoint === endpoint
    );
    if (stashIDs.length > 1 && props.scraped.remote_site_id) {
      const matchingID = stashIDs.find(
        (s) => s.stash_id === props.scraped.remote_site_id
      );
      if (matchingID) {
        return matchingID.stash_id;
      }
    }

    return props.studio.stash_ids?.find((s) => s.endpoint === endpoint)
      ?.stash_id;
  }

  const [name, setName] = useState<ScrapeResult<string>>(
    new ScrapeResult<string>(props.studio.name, props.scraped.name)
  );

  const [aliases, setAliases] = useState<ScrapeResult<string>>(
    new ScrapeResult<string>(
      props.studio.aliases?.join(", "),
      props.scraped.aliases
    )
  );

  const [urls, setURLs] = useState<ScrapeResult<string[]>>(
    new ScrapeResult<string[]>(
      props.studio.urls,
      props.scraped.urls
        ? uniq((props.studio.urls ?? []).concat(props.scraped.urls ?? []))
        : undefined
    )
  );

  const [details, setDetails] = useState<ScrapeResult<string>>(
    new ScrapeResult<string>(props.studio.details, props.scraped.details)
  );

  // Parent studio handling
  const existingParent: GQL.ScrapedStudio | undefined = props.parentStudio
    ? {
        stored_id: props.parentStudio.id,
        name: props.parentStudio.name,
      }
    : undefined;

  const [parent, setParent] = useState<ObjectScrapeResult<GQL.ScrapedStudio>>(
    new ObjectScrapeResult<GQL.ScrapedStudio>(
      existingParent,
      props.scraped.parent
    )
  );

  const [newParentStudio, setNewParentStudio] = useState<
    GQL.ScrapedStudio | undefined
  >(props.scraped.parent && !props.scraped.parent.stored_id ? props.scraped.parent : undefined);

  const createNewParentStudio = useCreateScrapedStudio({
    scrapeResult: parent,
    setScrapeResult: setParent,
    setNewObject: setNewParentStudio,
    endpoint,
  });

  const { tags, newTags, scrapedTagsRow, linkDialog } = useScrapedTags(
    props.studioTags,
    props.scraped.tags,
    endpoint
  );

  const [image, setImage] = useState<ScrapeResult<string>>(
    new ScrapeResult<string>(props.studio.image, props.scraped.image)
  );

  const [remoteSiteID, setRemoteSiteID] = useState<ScrapeResult<string>>(
    new ScrapeResult<string>(
      getCurrentRemoteSiteID(),
      props.scraped.remote_site_id
    )
  );

  const allFields = [
    name,
    aliases,
    urls,
    details,
    parent,
    tags,
    image,
    remoteSiteID,
  ];

  // don't show the dialog if nothing was scraped
  if (allFields.every((r) => !r.scraped) && newTags.length === 0 && !newParentStudio) {
    props.onClose();
    return <></>;
  }

  function makeNewScrapedItem(): GQL.ScrapedStudio {
    const newParent = parent.getNewValue();
    return {
      name: name.getNewValue() ?? "",
      aliases: aliases.getNewValue(),
      urls: urls.getNewValue(),
      details: details.getNewValue(),
      parent: newParent
        ? {
            stored_id: newParent.stored_id,
            name: newParent.name,
          }
        : undefined,
      tags: tags.getNewValue(),
      image: image.getNewValue(),
      remote_site_id: remoteSiteID.getNewValue(),
    };
  }

  function renderScrapeRows() {
    return (
      <>
        <ScrapedInputGroupRow
          field="name"
          title={intl.formatMessage({ id: "name" })}
          result={name}
          onChange={(value) => setName(value)}
        />
        <ScrapedTextAreaRow
          field="aliases"
          title={intl.formatMessage({ id: "aliases" })}
          result={aliases}
          onChange={(value) => setAliases(value)}
        />
        <ScrapedStringListRow
          field="urls"
          title={intl.formatMessage({ id: "urls" })}
          result={urls}
          onChange={(value) => setURLs(value)}
        />
        <ScrapedTextAreaRow
          field="details"
          title={intl.formatMessage({ id: "details" })}
          result={details}
          onChange={(value) => setDetails(value)}
        />
        <ScrapedStudioRow
          field="parent"
          title={intl.formatMessage({ id: "parent_studio" })}
          result={parent}
          onChange={(value) => setParent(value)}
          newStudio={newParentStudio}
          onCreateNew={createNewParentStudio}
        />
        {scrapedTagsRow}
        <ScrapedImageRow
          field="image"
          title={intl.formatMessage({ id: "image" })}
          className="studio-image"
          result={image}
          onChange={(value) => setImage(value)}
        />
        <ScrapedInputGroupRow
          field="remote_site_id"
          title={intl.formatMessage({ id: "stash_id" })}
          result={remoteSiteID}
          locked
          onChange={(value) => setRemoteSiteID(value)}
        />
      </>
    );
  }

  if (linkDialog) {
    return linkDialog;
  }

  return (
    <ScrapeDialog
      title={intl.formatMessage(
        { id: "dialogs.scrape_entity_title" },
        { entity_type: intl.formatMessage({ id: "studio" }) }
      )}
      onClose={(apply) => {
        props.onClose(apply ? makeNewScrapedItem() : undefined);
      }}
    >
      {renderScrapeRows()}
    </ScrapeDialog>
  );
};
