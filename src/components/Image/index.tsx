import {
  forwardRef,
  useRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";

import "./ImageStyle.css";

type ImageFit = "cover" | "contain" | "fill" | "none" | "scale-down";

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  objectFit?: ImageFit;
  objectPosition?: string;
  fallback?: string;
  placeholder?: ReactNode;
  priority?: boolean;
  fullWidth?: boolean;
  enable3D?: boolean;
  to?: string;
  containerClassName?: string;
  containerStyle?: CSSProperties;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      aspectRatio,
      objectFit = "cover",
      objectPosition = "center",
      fallback,
      placeholder,
      priority = false,
      fullWidth = false,
      enable3D = false,
      to,
      containerClassName = "",
      containerStyle,
      className = "",
      style,
      onLoad,
      onError,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLElement>(null);
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      setHasError(false);

      onLoad?.(event);
    };

    const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoading(false);
      setHasError(true);

      if (fallback && imageSrc !== fallback) {
        setImageSrc(fallback);
      }

      onError?.(event);
    };

    const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
      if (!enable3D || event.pointerType !== "mouse") {
        return;
      }

      const container = containerRef.current;

      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 12;
      const rotateX = (0.5 - y) * 12;

      container.style.setProperty(
        "--image-rotate-x",
        `${rotateX.toFixed(2)}deg`,
      );

      container.style.setProperty(
        "--image-rotate-y",
        `${rotateY.toFixed(2)}deg`,
      );
    };

    const handlePointerLeave = () => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      container.style.setProperty("--image-rotate-x", "0deg");
      container.style.setProperty("--image-rotate-y", "0deg");
    };

    const containerClasses = [
      "image",
      fullWidth && "image--full-width",
      enable3D && "image--3d",
      isLoading && "image--loading",
      hasError && "image--error",
      containerClassName,
    ]
      .filter(Boolean)
      .join(" ");

    const containerStyles: CSSProperties = {
      ...(aspectRatio && { aspectRatio }),
      ...containerStyle,
    };

    const imageStyles: CSSProperties = {
      objectFit,
      objectPosition,
      ...style,
    };

    const imageElement = (
      <img
        {...props}
        ref={ref}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={`image__element ${className}`}
        style={imageStyles}
        onLoad={handleLoad}
        onError={handleError}
      />
    );

    return (
      <figure
        ref={containerRef}
        className={containerClasses}
        style={containerStyles}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {isLoading && placeholder && (
          <span className="image__placeholder" aria-hidden="true">
            {placeholder}
          </span>
        )}

        {to ? <Link to={to}>{imageElement}</Link> : imageElement}
      </figure>
    );
  },
);
