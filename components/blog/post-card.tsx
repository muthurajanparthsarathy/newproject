import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPostDate, type PostMeta } from "@/lib/blog";
import { PostCover } from "./post-cover";

/** Draft / scheduled badge — only ever rendered in `next dev`. */
export function PostStatusBadge({ post, className }: { post: PostMeta; className?: string }) {
  if (post.status === "published") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        post.status === "draft" ? "bg-slate-900 text-white" : "bg-amber-100 text-amber-800",
        className
      )}
    >
      {post.status === "draft" ? "Draft" : `Scheduled · ${formatPostDate(post.date)}`}
    </span>
  );
}

export function PostMetaLine({ post, className }: { post: PostMeta; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground", className)}>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
        <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        {post.readingMinutes} min read
      </span>
    </div>
  );
}

export function PostCard({ post, featured }: { post: PostMeta; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600",
        featured && "lg:grid lg:grid-cols-12"
      )}
    >
      <PostCover
        post={post}
        priority={featured}
        sizes={featured ? "(max-width: 1024px) 100vw, 58vw" : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        className={cn("aspect-[16/9]", featured && "lg:col-span-7 lg:aspect-auto lg:min-h-80")}
      />

      <PostStatusBadge post={post} className="absolute left-4 top-4" />

      <div className={cn("flex flex-1 flex-col p-6", featured && "lg:col-span-5 lg:justify-center lg:p-10")}>
        <span className="self-start rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          {post.category}
        </span>
        <h3
          className={cn(
            "mt-4 font-semibold leading-snug text-foreground transition group-hover:text-brand-700",
            featured ? "text-xl sm:text-2xl" : "text-lg"
          )}
        >
          {post.title}
        </h3>
        <p
          className={cn(
            "mt-3 flex-1 text-sm leading-relaxed text-muted-foreground",
            featured ? "sm:text-base" : "line-clamp-3"
          )}
        >
          {post.description}
        </p>
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
          <PostMetaLine post={post} />
          <ArrowRight
            className="h-4 w-4 shrink-0 text-brand-600 transition group-hover:translate-x-1"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
