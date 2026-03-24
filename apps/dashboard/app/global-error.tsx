"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Catches errors in the root layout — must include <html> and <body>
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[BrandBuild] Root error:", error.message, error.digest);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#040507",
          color: "#eef2ff",
          fontFamily: "'Avenir Next', 'Segoe UI Variable', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            maxWidth: "440px",
            width: "100%",
            borderRadius: "2rem",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            padding: "2.5rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.38)",
              margin: "0 0 1.5rem",
            }}
          >
            BrandBuild
          </p>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              color: "#fff",
              margin: "0 0 0.75rem",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              lineHeight: 1.75,
              color: "rgba(255,255,255,0.54)",
              margin: "0 0 2rem",
            }}
          >
            An unexpected error occurred loading BrandBuild.
            {error.digest ? (
              <>
                <br />
                <span style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.75rem" }}>
                  Ref: {error.digest}
                </span>
              </>
            ) : null}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              onClick={reset}
              type="button"
              style={{
                background: "linear-gradient(135deg,rgba(255,218,103,0.22),rgba(92,129,255,0.28))",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: "9999px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                padding: "0.5rem 1.25rem",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "9999px",
                color: "rgba(255,255,255,0.7)",
                fontSize: "0.875rem",
                fontWeight: 600,
                padding: "0.5rem 1.25rem",
                textDecoration: "none",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
