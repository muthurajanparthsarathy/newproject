import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-mesh" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-grid opacity-50" aria-hidden />

      <Container className="text-center">
        <div className="mx-auto max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-700 backdrop-blur">
            404
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Page <span className="text-gradient">not found</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            The page you&rsquo;re looking for has moved or never existed. Let&rsquo;s
            get you back on track.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/" size="lg">
              <Home className="h-4 w-4" />
              Back to home
            </Button>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:border-brand-500 hover:text-brand-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Contact support
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
