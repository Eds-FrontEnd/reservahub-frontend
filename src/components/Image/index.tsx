import {
  forwardRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";

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

    const containerClasses = [
      "image",
      fullWidth && "image--full-width",
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

    return (
      <figure className={containerClasses} style={containerStyles}>
        {isLoading && placeholder && (
          <span className="image__placeholder" aria-hidden="true">
            {placeholder}
          </span>
        )}

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
      </figure>
    );
  },
);

Image.displayName = "Image";
