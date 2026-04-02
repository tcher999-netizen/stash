import React, { useEffect, useRef, useState } from "react";
import cx from "classnames";
import { LoadingIndicator } from "./LoadingIndicator";
import { Button } from "react-bootstrap";
import {
  faArrowLeft,
  faArrowRight,
  faTh,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "./Icon";
import { FormattedMessage } from "react-intl";

interface IImageSelectorProps {
  imageClassName?: string;
  images: string[];
  imageIndex: number;
  setImageIndex: (index: number) => void;
}

export const ImageSelector: React.FC<IImageSelectorProps> = ({
  imageClassName,
  images,
  imageIndex,
  setImageIndex,
}) => {
  const [imageState, setImageState] = useState<
    "loading" | "error" | "loaded" | "empty"
  >("empty");
  const [loadDict, setLoadDict] = useState<Record<number, boolean>>({});
  const [currentImage, setCurrentImage] = useState<string>("");
  const [galleryView, setGalleryView] = useState(false);
  const prefetchedRef = useRef(false);

  // Prefetch all images on mount
  useEffect(() => {
    if (prefetchedRef.current || images.length <= 1) return;
    prefetchedRef.current = true;
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [images]);

  useEffect(() => {
    if (imageState !== "loading") {
      setCurrentImage(images[imageIndex]);
    }
  }, [imageState, imageIndex, images]);

  const changeImage = (index: number) => {
    setImageIndex(index);
    if (!loadDict[index]) setImageState("loading");
  };

  const setPrev = () =>
    changeImage(imageIndex === 0 ? images.length - 1 : imageIndex - 1);
  const setNext = () =>
    changeImage(imageIndex === images.length - 1 ? 0 : imageIndex + 1);

  const handleLoad = (index: number) => {
    setLoadDict({
      ...loadDict,
      [index]: true,
    });
    setImageState("loaded");
  };
  const handleError = () => setImageState("error");

  if (galleryView && images.length > 1) {
    return (
      <div className="image-selection">
        <div className="select-buttons">
          <h5 className="image-index">
            <FormattedMessage
              id="index_of_total"
              values={{
                index: imageIndex + 1,
                total: images.length,
              }}
            />
          </h5>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setGalleryView(false)}
            title="Single view"
          >
            <Icon icon={faImage} />
          </Button>
        </div>
        <div className="image-gallery-grid">
          {images.map((src, i) => (
            <div
              key={i}
              className={cx("image-gallery-thumb", {
                selected: i === imageIndex,
              })}
              onClick={() => {
                changeImage(i);
                setGalleryView(false);
              }}
            >
              <img src={src} alt="" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="image-selection">
      {images.length > 1 && (
        <div className="select-buttons">
          <Button onClick={setPrev} disabled={images.length === 1}>
            <Icon icon={faArrowLeft} />
          </Button>
          <h5 className="image-index">
            <FormattedMessage
              id="index_of_total"
              values={{
                index: imageIndex + 1,
                total: images.length,
              }}
            />
          </h5>
          <Button onClick={setNext} disabled={images.length === 1}>
            <Icon icon={faArrowRight} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setGalleryView(true)}
            className="ml-2"
            title="Gallery view"
          >
            <Icon icon={faTh} />
          </Button>
        </div>
      )}

      <div className="performer-image">
        {/* hidden image to handle loading */}
        <img
          src={images[imageIndex]}
          className="d-none"
          onLoad={() => handleLoad(imageIndex)}
          onError={handleError}
        />
        <img
          src={currentImage}
          className={cx(imageClassName, { loading: imageState === "loading" })}
          alt=""
        />
        {imageState === "loading" && <LoadingIndicator />}
        {imageState === "error" && (
          <div className="h-100 d-flex justify-content-center align-items-center">
            <b>
              <FormattedMessage
                id="errors.loading_type"
                values={{ type: "image" }}
              />
            </b>
          </div>
        )}
      </div>
    </div>
  );
};
