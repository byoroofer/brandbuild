import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { MobileActionBar } from "@/components/site/mobile-action-bar";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { imageUrls, siteMeta } from "@/lib/site-content";

export const metadata: Metadata = {
  title: {
    default: `${siteMeta.title} | ElectTJ`,
    template: `%s | ElectTJ`,
  },
  description: siteMeta.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://electtj.com"),
  openGraph: {
    title: `${siteMeta.title} | ElectTJ`,
    description: siteMeta.description,
    images: [{ url: imageUrls.hero }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteMeta.title} | ElectTJ`,
    description: siteMeta.description,
    images: [imageUrls.hero],
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(circle_at_top,rgba(243,213,160,0.14),transparent_48%)]" />
        <div className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_bottom,rgba(113,136,255,0.18),transparent_58%)]" />
        <SiteHeader />
        <main className="relative pb-28 pt-8 sm:pb-12 sm:pt-12">{children}</main>
        <SiteFooter />
        <MobileActionBar />
      </body>
    </html>
  );
}
