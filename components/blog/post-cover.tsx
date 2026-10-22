import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { Camera, Code2, Globe2, Megaphone, Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostMeta } from "@/lib/blog";

type CategoryStyle = { icon: LucideIcon; background: string; iconColor: string };

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Websites: {
    icon: Globe2,
    background: "from-sky-50 via-white to-blue-100",
    iconColor: "text-brand-600",
  },
  Marketing: {
    icon: Megaphone,
    background: "from-cyan-50 via-white to-sky-100",
    iconColor: "text-sky-600",
  },
  "Video & Photo": {
    icon: Camera,
    background: "from-orange-50 via-white to-amber-100",
    iconColor: "text-amber-700",
  },
  Software: {
    icon: Code2,
    background: "from-indigo-50 via-white to-blue-100",
    iconColor: "text-indigo-600",
  },
};

const DEFAULT_STYLE: CategoryStyle = {
  icon: Newspaper,
  background: "from-slate-50 via-white to-brand-100",
  iconColor: "text-brand-600",
};

/**
 * The post's cover photo, or — when a post has none — a branded panel keyed
 * to its category, so the blog never needs stock photography.
 */
export function PostCover({
  post,
  sizes,
  priority,
  className,
}: {
  post: Pick<PostMeta, "title" | "category" | "cover" | "coverAlt">;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (post.cover) {
    return (
      <div className={cn("relative overflow-hidden bg-slate-100", className)}>
        <Image
          src={post.cover}
          alt={post.coverAlt ?? post.title}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  const style = CATEGORY_STYLES[post.category] ?? DEFAULT_STYLE;
  const Icon = style.icon;

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        style.background,
        className
      )}
    >
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="relative flex flex-col items-center gap-3">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 shadow-soft backdrop-blur transition duration-500 group-hover:scale-110">
          <Icon className={cn("h-7 w-7", style.iconColor)} strokeWidth={1.75} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {post.category}
        </span>
      </div>
    </div>
  );
}
