"use client";

/**
 * Last-resort error boundary that catches errors thrown during the root layout
 * itself (where the regular `error.tsx` cannot reach). Must include its own
 * <html> + <body> tags because it replaces the whole document.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#dc2626",
              marginBottom: 12,
            }}
          >
            Application error
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Something went very wrong
          </h1>
          <p
            style={{
              marginTop: 16,
              color: "#475569",
              fontSize: 16,
              lineHeight: 1.5,
            }}
          >
            We&rsquo;ve been notified. Please try again — or come back in a
            moment.
          </p>
          {error.digest ? (
            <p
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "#94a3b8",
              }}
            >
              Error ID: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 24,
              background: "#2563eb",
              color: "white",
              border: 0,
              padding: "12px 24px",
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
