import { db } from "@/lib/db";

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap() {
  const baseUrl = process.env.NEXTAUTH_URL || "https://dsa-vault.vercel.app";

  // Static routes
  const staticRoutes = ["", "/problems", "/topics", "/stats", "/about"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic difficulty routes
  const difficultyRoutes = ["easy", "medium", "hard"].map((level) => ({
    url: `${baseUrl}/difficulty/${level}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // Fetch problems and tags for sitemap (wrapped in try/catch to avoid build errors if database is not reachable at build-time)
  let problemRoutes = [];
  let topicRoutes = [];

  try {
    const problems = await db.problem.findMany({
      select: { slug: true, updatedAt: true },
    });

    problemRoutes = problems.map((problem) => ({
      url: `${baseUrl}/problems/${problem.slug}`,
      lastModified: problem.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const tags = await db.tag.findMany({
      select: { name: true },
    });

    topicRoutes = tags.map((tag) => {
      const slug = tag.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return {
        url: `${baseUrl}/topics/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.5,
      };
    });
  } catch (error) {
    console.warn("⚠️ Failed to fetch dynamic database routes for sitemap during build:", error.message || error);
  }

  return [...staticRoutes, ...difficultyRoutes, ...problemRoutes, ...topicRoutes];
}
