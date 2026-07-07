import type { ReactNode, HTMLAttributes } from "react";
import "./Card.css";

type CardProps = {
  interactive?: boolean;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLElement>;

function CardIcon({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card__icon${className ? ` ${className}` : ""}`} {...rest}>{children}</div>;
}

function CardContent({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card__content${className ? ` ${className}` : ""}`} {...rest}>{children}</div>;
}

function CardActions({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card__actions${className ? ` ${className}` : ""}`} {...rest}>{children}</div>;
}

export function Card({
  interactive = false,
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <article
      className={`card${interactive ? " card--interactive" : ""}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {children}
    </article>
  );
}

Card.Icon = CardIcon;
Card.Content = CardContent;
Card.Actions = CardActions;
