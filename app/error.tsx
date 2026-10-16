"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error to whatever monitoring you wire up later (Sentry, etc.)
    if (process.env.NODE_ENV !== "production") {
      console.error("App error:", error);
    }
  }, [error]);

  return (
    <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-mesh" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-grid opacity-50" aria-hidden />

      <Container className="text-center">
        <div className="mx-auto max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-rose-200 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700 backdrop-blur">
            Something went wrong
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            We hit an <span className="text-gradient">unexpected error</span>
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            Sorry — something on this page didn&rsquo;t load properly. Try again or
            head back home.
          </p>
          {error.digest ? (
            <p className="mt-2 text-xs text-muted-foreground/80">
              Error ID: {error.digest}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={reset} size="lg">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button href="/" variant="outline" size="lg">
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
