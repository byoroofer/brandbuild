import type { MetadataRoute } from "next";

const routes = [
  "",
  "/about-tj",
  "/policy",
  "/cd-24",
  "/media",
  "/events",
  "/volunteer",
  "/donate",
  "/campaign-merch",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://electtj.com";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
