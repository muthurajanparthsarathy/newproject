import * as React from "react";
import { cn } from "@/lib/utils";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  as?: "section" | "div" | "article";
  bleed?: boolean;
};

export function Section({
  className,
  as: Tag = "section",
  bleed,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn(
        "relative w-full",
        !bleed && "py-12 md:py-20",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}
      {...props}
    />
  );
}

type EyebrowProps = React.HTMLAttributes<HTMLSpanElement>;

export function Eyebrow({ className, ...props }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700",
        className
      )}
      {...props}
    />
  );
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-3xl space-y-5",
        align === "center" ? "text-center" : "text-left mx-0",
        className
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base text-muted-foreground sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
