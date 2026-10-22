import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { ContactCTA } from "@/components/sections/contact-cta";
import { PostCard, PostMetaLine, PostStatusBadge } from "@/components/blog/post-card";
import { PostCover } from "@/components/blog/post-cover";
import { PostToc } from "@/components/blog/post-toc";
import { ShareButtons } from "@/components/blog/share-buttons";
import { getPost, getPosts } from "@/lib/blog";
import { SITE, buildWhatsAppLink } from "@/lib/utils";
import { getBlogPostingJsonLd, getBreadcrumbJsonLd } from "@/lib/seo";

// Re-check hourly so scheduled posts go live (and edits show) without a new deploy
export const revalidate = 3600;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: [post.author],
      section: post.category,
      tags: post.tags,
      ...(post.cover ? { images: [{ url: post.cover, alt: post.coverAlt ?? post.title }] } : {}),
    },
    ...(post.status !== "published" ? { robots: { index: false, follow: false } } : {}),
  };
}

const PROSE = [
  "prose prose-slate max-w-none sm:prose-lg",
  "prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-28",
  "prose-a:font-medium prose-a:text-brand-600 prose-a:underline-offset-4 hover:prose-a:text-brand-700",
  "prose-strong:text-foreground prose-li:marker:text-brand-500",
  "prose-blockquote:rounded-r-xl prose-blockquote:border-l-brand-500 prose-blockquote:bg-brand-50/60 prose-blockquote:py-1 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-slate-700",
  "prose-img:rounded-2xl prose-img:border prose-img:border-slate-200",
  "prose-th:text-foreground prose-table:text-sm",
].join(" ");

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${SITE.url}/blog/${post.slug}`;
  const morePosts = getPosts()
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category))
    .slice(0, 3);
  const schemas = [
    getBlogPostingJsonLd(post),
    getBreadcrumbJsonLd([
      { name: "Home", href: "/" },
      { name: "Blog", href: "/blog" },
      { name: post.title, href: `/blog/${post.slug}` },
    ]),
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <article>
        <header className="relative isolate overflow-hidden border-b border-slate-100">
          <div className="absolute inset-0 -z-10 bg-mesh" aria-hidden />
          <div className="absolute inset-0 -z-10 bg-grid opacity-50" aria-hidden />

          <Container className="pt-24 pb-10 md:pt-28 md:pb-14">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-8">
                <nav
                  aria-label="Breadcrumb"
                  className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
                >
                  <Link href="/" className="hover:text-brand-600">Home</Link>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  <Link href="/blog" className="hover:text-brand-600">Blog</Link>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden />
                  <span className="text-foreground">{post.category}</span>
                </nav>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 shadow-soft backdrop-blur">
                    {post.category}
                  </span>
                  <PostStatusBadge post={post} />
                </div>

                <h1 className="mt-4 font-display text-[2rem] font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                  {post.title}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {post.description}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand font-display text-sm font-bold text-white"
                    >
                      {post.author.charAt(0)}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{post.author}</div>
                      <div className="text-xs text-muted-foreground">{SITE.city}</div>
                    </div>
                  </div>
                  <PostMetaLine post={post} className="text-sm" />
                </div>
              </div>
            </div>
          </Container>
        </header>

        <Section>
          <Container>
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-8">
                {post.cover ? (
                  <PostCover
                    post={post}
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="mb-10 aspect-[16/9] rounded-3xl border border-slate-200"
                  />
                ) : null}

                <div className={PROSE} dangerouslySetInnerHTML={{ __html: post.html }} />

                {post.tags.length ? (
                  <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
                    {post.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        #{tag}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-10 flex flex-col gap-6 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
                  <ShareButtons title={post.title} url={url} />
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    All posts
                  </Link>
                </div>
              </div>

              <aside className="lg:col-span-4">
                <div className="space-y-6 lg:sticky lg:top-28">
                  {post.toc.length > 1 ? (
                    <div className="hidden lg:block">
                      <PostToc items={post.toc} />
                    </div>
                  ) : null}

                  <div className="relative overflow-hidden rounded-2xl bg-gradient-brand p-6 text-white shadow-glow">
                    <div
                      className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl"
                      aria-hidden
                    />
                    <p className="relative font-display text-lg font-bold leading-snug">
                      Want this done for your business?
                    </p>
                    <p className="relative mt-2 text-sm leading-relaxed text-white/85">
                      Tell us what you need on WhatsApp and we&rsquo;ll come back within 24 hours.
                    </p>
                    <Button
                      href={buildWhatsAppLink(`Hi Prova Media, I read "${post.title}" and want to talk.`)}
                      external
                      variant="outline"
                      className="relative mt-5 w-full border-white text-brand-700 hover:text-brand-800"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden />
                      Chat on WhatsApp
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          </Container>
        </Section>
      </article>

      {morePosts.length ? (
        <Section className="border-t border-slate-100 bg-white/40">
          <Container>
            <SectionHeading eyebrow="Keep reading" title="More from the blog" align="left" />
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {morePosts.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <ContactCTA />
    </>
  );
}
