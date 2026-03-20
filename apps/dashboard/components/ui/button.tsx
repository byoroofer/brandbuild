import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "lg";

const baseStyles =
  "inline-flex items-center justify-center rounded-full font-medium transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-60";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border border-blue-600 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 text-white shadow-[0_18px_45px_rgba(37,99,235,0.22)] hover:-translate-y-0.5",
  secondary:
    "border border-slate-200 bg-white/85 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:border-blue-200",
  ghost:
    "border border-slate-200/80 bg-white/40 text-slate-700 hover:-translate-y-0.5 hover:bg-white/70",
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type ButtonLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  href,
  size = "md",
  variant = "primary",
}: ButtonLinkProps) {
  return (
    <Link className={cx(baseStyles, variantStyles[variant], sizeStyles[size], className)} href={href}>
      {children}
    </Link>
  );
}
