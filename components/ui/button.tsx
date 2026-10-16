import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-brand text-white shadow-[0_10px_30px_-10px_rgb(37_99_235_/_0.5)] hover:shadow-[0_18px_40px_-12px_rgb(37_99_235_/_0.6)] hover:-translate-y-0.5 active:translate-y-0",
        secondary:
          "bg-foreground text-white hover:bg-slate-800 hover:-translate-y-0.5",
        outline:
          "bg-white border border-slate-200 text-foreground hover:border-brand-500 hover:text-brand-600 hover:shadow-soft hover:-translate-y-0.5",
        ghost:
          "text-foreground hover:bg-slate-100",
        whatsapp:
          "bg-[#25D366] text-white hover:bg-[#1ebe5a] hover:-translate-y-0.5 shadow-[0_10px_30px_-10px_rgb(37_211_102_/_0.55)]",
        link: "text-brand-600 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

type CommonProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

type ButtonAsLink = CommonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    external?: boolean;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { className, variant, size, children, ...rest } = props;

  if ("href" in rest && rest.href) {
    const { href, external, ...anchorProps } = rest as ButtonAsLink;
    if (external || /^https?:\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={cn(buttonVariants({ variant, size }), className)}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={cn(buttonVariants({ variant, size }), className)}
        {...anchorProps}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

export { buttonVariants };
