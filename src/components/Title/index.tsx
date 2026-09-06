import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import "./TitleStyle.css";

type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

type TitleAlign = "left" | "center" | "right";

type TitleSize = "small" | "medium" | "large" | "xlarge";

export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  level?: TitleLevel;
  align?: TitleAlign;
  size?: TitleSize;
  fontSize?: CSSProperties["fontSize"];
  color?: CSSProperties["color"];
  fullWidth?: boolean;
  width?: CSSProperties["width"];
}

export const Title = forwardRef<HTMLHeadingElement, TitleProps>(
  (
    {
      children,
      level = 2,
      align = "left",
      size = "medium",
      fontSize,
      color,
      fullWidth = true,
      width,
      className = "",
      style,
      ...props
    },
    ref,
  ) => {
    const HeadingTag = `h${level}` as ElementType;

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
