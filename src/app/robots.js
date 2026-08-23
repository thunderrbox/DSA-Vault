export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ubiquitous-dango-feef0b.netlify.app";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
