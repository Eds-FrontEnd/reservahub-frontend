import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./TitleStyle.css";

type TitleElement = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

type TitleAlign = "left" | "center" | "right";

type TitleSize = "small" | "medium" | "large" | "xlarge";

export interface TitleProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: TitleElement;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  align?: TitleAlign;
  size?: TitleSize;
  fontSize?: CSSProperties["fontSize"];
  color?: CSSProperties["color"];
  fullWidth?: boolean;
  width?: CSSProperties["width"];
  margin?: CSSProperties["margin"];
  padding?: CSSProperties["padding"];
}

export const Title = forwardRef<HTMLElement, TitleProps>(
  (
    {
      children,
      as,
      level = 2,
      align = "left",
      size = "medium",
      fontSize,
      color,
      fullWidth = true,
      width,
      className = "",
      style,
      margin,
      padding,
      ...props
    },
    ref,
  ) => {
    const HeadingTag = (as ?? `h${level}`) as ElementType;

    const titleStyle = {
      ...(width && {
        width,
      }),
      ...(fontSize && {
        "--title-font-size": fontSize,
      }),
      ...(color && {
        "--title-color": color,
      }),
      ...(margin && {
        margin,
      }),
      ...(padding && {
        padding,
      }),
      ...style,
    } as CSSProperties;

    const classes = [
      "title",
      `title--${align}`,
      `title--${size}`,
      fullWidth && !width && "title--full-width",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <HeadingTag {...props} ref={ref} className={classes} style={titleStyle}>
        {children}
      </HeadingTag>
    );
  },
);

Title.displayName = "Title";
