import type { Metadata } from "next";
import { MessageCircle, PenLine } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Section, Container } from "@/components/ui/section";
import { Stagger, StaggerItem } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { ContactCTA } from "@/components/sections/contact-cta";
import { PostCard } from "@/components/blog/post-card";
import { getPosts } from "@/lib/blog";
import { buildWhatsAppLink } from "@/lib/utils";

// Re-check hourly so scheduled posts appear without a new deploy
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Website, Marketing & Content Tips for Coimbatore Businesses",
  description:
    "Practical guides from Prova Media on websites, social media, ads, SEO and product shoots — written for Coimbatore and Tamil Nadu business owners.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Prova Media Blog — Grow Your Business Online",
    description:
      "Practical guides on websites, social media, ads, SEO and product shoots for local businesses.",
    url: "/blog",
    type: "website",
  },
};

export default function BlogPage() {
  const [featured, ...rest] = getPosts();

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title={
          <>
            Ideas to grow your <span className="text-gradient">business online</span>
          </>
        }
        description="Plain-language guides on websites, social media, ads and content — from the team that shoots, builds and markets for local brands."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      <Section>
        <Container>
          {featured ? (
            <>
              <PostCard post={featured} featured />
              {rest.length ? (
                <Stagger className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <StaggerItem key={post.slug}>
                      <PostCard post={post} />
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : null}
            </>
          ) : (
            <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-slate-300 bg-white/70 p-12 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                <PenLine className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-5 text-2xl font-bold">First posts are on the way</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Got a question about websites, ads or content? Ask us — it might become our next post.
              </p>
              <Button
                href={buildWhatsAppLink("Hi Prova Media, I have a question for your blog.")}
                external
                variant="whatsapp"
                className="mt-6"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                Ask on WhatsApp
              </Button>
            </div>
          )}
        </Container>
      </Section>

      <ContactCTA />
    </>
  );
}
