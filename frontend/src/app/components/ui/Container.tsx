import type { ReactNode, HTMLAttributes } from "react";
import "./Container.css";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

type ContainerProps = {
  size?: ContainerSize;
  className?: string;
  children?: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export function Container({
  size = "xl",
  className = "",
  children,
  ...rest
}: ContainerProps) {
  return (
    <div className={`cnt cnt--${size}${className ? ` ${className}` : ""}`} {...rest}>
      {children}
    </div>
  );
}