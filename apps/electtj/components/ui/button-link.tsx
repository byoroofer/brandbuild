import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  children: ReactNode;
  className?: string;
  external?: boolean;
  href: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "light";
};

const sizeStyles = {
  sm: "px-4 py-2.5 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-base",
};

const variantStyles = {
  primary:
    "border border-[rgba(201,155,82,0.45)] bg-[linear-gradient(135deg,#f3d5a0,#c99b52)] text-slate-950 shadow-[0_18px_40px_rgba(201,155,82,0.18)] hover:border-[rgba(243,213,160,0.8)]",
  secondary:
    "border border-white/14 bg-white/6 text-white hover:border-[rgba(243,213,160,0.44)] hover:bg-white/10",
  ghost: "border border-transparent bg-transparent text-[var(--text-muted)] hover:bg-white/6 hover:text-white",
  light:
    "border border-slate-200 bg-white text-slate-950 shadow-[0_16px_34px_rgba(15,23,42,0.08)] hover:border-slate-300 hover:bg-slate-50",
};

function cx(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function ButtonLink({
  children,
  className,
  external,
  href,
  size = "md",
  variant = "primary",
}: ButtonLinkProps) {
  const classes = cx(
    "inline-flex items-center justify-center rounded-full font-semibold tracking-[0.02em] transition duration-200 hover:-translate-y-0.5",
    sizeStyles[size],
    variantStyles[variant],
    className,
  );
  const isProtocolLink =
    href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
  const shouldOpenExternally = external ?? isProtocolLink;

  if (shouldOpenExternally) {
    return (
      <a
        className={classes}
        href={href}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        target={href.startsWith("http") ? "_blank" : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={classes} href={href}>
      {children}
    </Link>
  );
}
