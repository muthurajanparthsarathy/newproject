import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, Container, SectionHeading } from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/reveal";
import { PageHero } from "@/components/sections/page-hero";
import { ProcessSection } from "@/components/sections/process";
import { ContactForm } from "@/components/sections/contact-form";
import { products, services } from "@/lib/content";
import { getCategory, getSubService, type SubService } from "@/lib/service-catalog";
import { buildWhatsAppLink, cn } from "@/lib/utils";

/** One-line description for any page a menu item can point to. */
function describe(href: string) {
  const slug = href.split("/").pop() ?? "";
  if (href.startsWith("/products/")) return products.find((p) => p.slug === slug)?.shortDescription;
  return getSubService(slug)?.summary ?? services.find((s) => s.slug === slug)?.shortDescription;
}

export function SubServiceDetail({ sub }: { sub: SubService }) {
  const category = getCategory(sub.category);
  const parent = services.find((s) => s.slug === sub.parent);
  const shortName = sub.menuLabel ?? sub.name;
  const related = category.items.filter((item) => item.href !== `/services/${sub.slug}`);
  const Icon = sub.icon;

  return (
    <>
      <PageHero
        eyebrow={category.title}
        title={sub.name}
        description={sub.intro}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          parent
            ? { label: parent.name, href: parent.href }
            : { label: category.title, href: "/services#all-services" },
          { label: shortName },
        ]}
        actions={
          <>
            <Button href="#enquire">
              Get a free quote
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              href={buildWhatsAppLink(`Hi Prova Media, I'd like to know more about ${sub.name}.`)}
              external
              variant="whatsapp"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp us
            </Button>
          </>
        }
      />

      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="What's included"
              title={
                <>
                  What you get with <span className="text-gradient">{shortName}</span>
                </>
              }
              description={sub.summary}
            />
          </Reveal>

          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {sub.includes.map((item) => (
              <StaggerItem key={item.title}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                  <span
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft",
                      category.accent
                    )}
                  >
                    <Check className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section className="bg-white/40">
        <Container>
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
            <Reveal direction="left" className="lg:col-span-7">
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
                <span className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                  Who it&rsquo;s for
                </span>
                <h2 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
                  A good fit if you are&hellip;
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {sub.idealFor.map((line) => (
                    <li key={line} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                        <Check className="h-3 w-3" aria-hidden />
                      </span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal direction="right" className="lg:col-span-5">
              <div className="relative h-full overflow-hidden rounded-2xl bg-gradient-brand p-6 text-white shadow-glow sm:p-8">
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" aria-hidden />
                <div className="relative flex h-full flex-col">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/80">
                    Pricing
                  </span>
                  <div className="mt-1 font-display text-2xl font-bold text-white">
                    {sub.startsAt ? `Starts at ${sub.startsAt}` : "Quoted per project"}
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/85">
                    {sub.startsAt
                      ? "The final price depends on what you need — we confirm it in writing before we start."
                      : "Every business needs a different mix, so we send a clear, written quote after a short call."}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href="#enquire" variant="outline" size="sm" className="border-white text-brand-700">
                      Get a quote
                    </Button>
                    {sub.pricingHref ? (
                      <Link
                        href={sub.pricingHref}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-white hover:bg-white/10"
                      >
                        See plans
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <ProcessSection />

      {related.length ? (
        <Section>
          <Container>
            <SectionHeading
              eyebrow="Related"
              title={`More in ${category.title}`}
              align="left"
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-glow"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-brand-700">
                      {item.label}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{describe(item.href)}</p>
                  </div>
                  <ArrowRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 transition group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      ) : null}

      <Section id="enquire" className="scroll-mt-20 bg-white/40">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Reveal>
                <SectionHeading
                  eyebrow="Get in touch"
                  title={
                    <>
                      Tell us what you <span className="text-gradient">need</span>
                    </>
                  }
                  description="Share a few details and we'll get back within 24 hours with a clear plan and quote."
                  align="left"
                />
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <Reveal direction="right">
                <ContactForm defaultService={parent?.name ?? "Not sure"} />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
