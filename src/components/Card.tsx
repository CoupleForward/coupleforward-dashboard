import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  as?: "div" | "section" | "article";
  padded?: boolean;
};

export function Card({
  children,
  className = "",
  padded = true,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={`relative rounded-[12px] bg-card border border-line-soft/70 ${
        padded ? "p-5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-cream-mute">
      {children}
    </div>
  );
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <div className="text-[15px] font-medium text-cream">{children}</div>;
}
