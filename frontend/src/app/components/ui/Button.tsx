import { type ElementType, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import "./Button.css";

type ButtonOwnProps = {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  isLoading?: boolean;
  fullWidth?: boolean;
  as?: ElementType;
};

type ButtonAsButton = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & { as?: "button" };
type ButtonAsAnchor = ButtonOwnProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps> & { as: "a"; href: string };

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export function Button({
  variant = "primary",
  size = "md",
  startIcon: StartIcon,
  endIcon: EndIcon,
  isLoading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  as: Component = "button",
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const isDisabled = disabled || isLoading;

  if (Component === "a") {
    const { as: _, ...anchorRest } = rest as ButtonAsAnchor;
    return (
      <a className={classes} aria-disabled={isDisabled || undefined} {...anchorRest}>
        {isLoading && <span className="btn__spinner" aria-hidden="true" />}
        {!isLoading && StartIcon && <StartIcon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} aria-hidden="true" />}
        {children && <span className="btn__text">{children}</span>}
        {!isLoading && EndIcon && <EndIcon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} aria-hidden="true" />}
      </a>
    );
  }

  const { as: _, type = "button", ...buttonRest } = rest as ButtonAsButton;
  return (
    <button
      className={classes}
      disabled={isDisabled}
      type={type}
      {...buttonRest}
    >
      {isLoading && <span className="btn__spinner" aria-hidden="true" />}
      {!isLoading && StartIcon && <StartIcon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} aria-hidden="true" />}
      {children && <span className="btn__text">{children}</span>}
      {!isLoading && EndIcon && <EndIcon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} aria-hidden="true" />}
    </button>
  );
}