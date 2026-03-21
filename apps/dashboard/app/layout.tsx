import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { resolveAppUrl } from "@/lib/utils/app-url";

export const metadata: Metadata = {
  title: {
    default: "BrandBuild",
    template: "%s | BrandBuild",
  },
  description:
    "BrandBuild is an enterprise AI video generation platform that uses Sora 2, Kling, and Higgsfield to produce polished final videos through one controlled workflow.",
  metadataBase: new URL(resolveAppUrl()),
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(118,145,255,0.14),transparent_34%),radial-gradient(circle_at_16%_18%,rgba(84,205,255,0.1),transparent_22%),radial-gradient(circle_at_82%_10%,rgba(255,197,92,0.08),transparent_18%),linear-gradient(180deg,#040507_0%,#07090f_46%,#0b1119_100%)]" />
        <div className="brandbuild-grid-mask pointer-events-none fixed inset-0 -z-10 opacity-55" />
        <div className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-[18rem] bg-[radial-gradient(circle_at_bottom,rgba(255,198,94,0.1),transparent_42%)]" />
        <SiteHeader />
        <main className="relative">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
