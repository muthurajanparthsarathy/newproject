import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked, type Tokens } from "marked";
import { SITE } from "@/lib/utils";

/**
 * Markdown blog. Every post is one file in /content/blog — the file name is
 * the URL (content/blog/my-post.md → /blog/my-post). Files starting with "_"
 * (like _template.md) are ignored.
 *
 * Scheduling: a post goes live at 00:00 IST on its `date`. Pages revalidate
 * hourly, so a future-dated post appears within an hour of that time without
 * a new deploy. `draft: true` keeps a post hidden whatever the date.
 * In `next dev` drafts and scheduled posts are listed with a badge so they
 * can be previewed before they go live.
 */

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const WORDS_PER_MINUTE = 200;
const SHOW_UNPUBLISHED = process.env.NODE_ENV === "development";

export type PostStatus = "published" | "scheduled" | "draft";

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  /** Publish date, YYYY-MM-DD (IST) */
  date: string;
  updated?: string;
  category: string;
  author: string;
  cover?: string;
  coverAlt?: string;
  tags: string[];
  readingMinutes: number;
  status: PostStatus;
};

export type TocItem = { id: string; text: string };

export type Post = PostMeta & {
  html: string;
  toc: TocItem[];
};

type HeadingWithId = Tokens.Heading & { id?: string };

function toDateString(value: unknown, field: string, file: string) {
  // YAML turns an unquoted 2026-10-22 into a Date (UTC midnight)
  const text =
    value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? "").trim();
  if (!DATE_PATTERN.test(text)) {
    throw new Error(`content/blog/${file}: "${field}" must be a date like 2026-10-22`);
  }
  return text;
}

function requireText(data: Record<string, unknown>, field: string, file: string) {
  const value = typeof data[field] === "string" ? (data[field] as string).trim() : "";
  if (!value) throw new Error(`content/blog/${file}: "${field}" is required`);
  return value;
}

function publishTime(date: string) {
  return new Date(`${date}T00:00:00+05:30`).getTime();
}

function readPost(slug: string) {
  const file = `${slug}.md`;
  const fullPath = path.join(BLOG_DIR, file);
  if (!fs.existsSync(fullPath)) return null;

  const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
  const date = toDateString(data.date, "date", file);
  const status: PostStatus = data.draft
    ? "draft"
    : publishTime(date) > Date.now()
      ? "scheduled"
      : "published";

  const meta: PostMeta = {
    slug,
    title: requireText(data, "title", file),
    description: requireText(data, "description", file),
    date,
    updated: data.updated ? toDateString(data.updated, "updated", file) : undefined,
    category: typeof data.category === "string" ? data.category.trim() : "Insights",
    author: typeof data.author === "string" ? data.author.trim() : SITE.name,
    cover: typeof data.cover === "string" ? data.cover : undefined,
    coverAlt: typeof data.coverAlt === "string" ? data.coverAlt : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingMinutes: Math.max(1, Math.round(content.trim().split(/\s+/).length / WORDS_PER_MINUTE)),
    status,
  };
  return { meta, content };
}

function isVisible(meta: PostMeta) {
  return meta.status === "published" || SHOW_UNPUBLISHED;
}

/** Visible posts, newest first. */
export function getPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => readPost(f.slice(0, -3))?.meta)
    .filter((meta): meta is PostMeta => !!meta && isVisible(meta))
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

/** A single visible post with its HTML, or null (missing, draft or not yet due). */
export function getPost(slug: string): Post | null {
  if (!SLUG_PATTERN.test(slug)) return null;
  const post = readPost(slug);
  if (!post || !isVisible(post.meta)) return null;
  return { ...post.meta, ...renderMarkdown(post.content) };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const SITE_HOST = new URL(SITE.url).host;

function isExternal(href: string) {
  if (!/^https?:\/\//.test(href)) return false;
  try {
    return new URL(href).host !== SITE_HOST;
  } catch {
    return false;
  }
}

/**
 * Posts are written by the team and live in the repo, so their HTML is
 * trusted. Headings get ids for the table of contents; external links open
 * in a new tab; images lazy-load.
 */
function renderMarkdown(content: string) {
  const md = new Marked({
    gfm: true,
    renderer: {
      heading(token) {
        const { id } = token as HeadingWithId;
        const inner = this.parser.parseInline(token.tokens);
        return `<h${token.depth}${id ? ` id="${id}"` : ""}>${inner}</h${token.depth}>\n`;
      },
      link({ href, title, tokens }) {
        if (!isExternal(href)) return false;
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
        return `<a href="${escapeAttr(href)}"${titleAttr} target="_blank" rel="noopener noreferrer">${this.parser.parseInline(tokens)}</a>`;
      },
      image({ href, title, text }) {
        const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
        return `<img src="${escapeAttr(href)}" alt="${escapeAttr(text)}"${titleAttr} loading="lazy" decoding="async">`;
      },
    },
  });

  const tokens = md.lexer(content);
  const toc: TocItem[] = [];
  const used = new Map<string, number>();

  md.walkTokens(tokens, (token) => {
    if (token.type !== "heading") return;
    const heading = token as HeadingWithId;
    const base = slugify(heading.text) || "section";
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    heading.id = count ? `${base}-${count}` : base;
    if (heading.depth === 2) {
      toc.push({ id: heading.id, text: heading.text.replace(/[`*_~]/g, "") });
    }
  });

  // Wide tables scroll sideways on phones instead of stretching the page
  const html = md
    .parser(tokens)
    .replace(/<table>/g, '<div class="overflow-x-auto"><table>')
    .replace(/<\/table>/g, "</table></div>");

  return { html, toc };
}

export function formatPostDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${date}T00:00:00+05:30`));
}
