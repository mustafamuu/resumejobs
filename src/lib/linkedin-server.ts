import { createServerFn } from "@tanstack/react-start";

function parseLinkedInUrl(url: string): { slug: string; profileUrl: string } {
  const trimmed = url.trim();
  if (!trimmed) throw new Error("LinkedIn profile URL is required.");

  let normalized = trimmed;
  if (!normalized.startsWith("http")) normalized = `https://${normalized}`;

  const u = new URL(normalized);
  if (!u.hostname.includes("linkedin.com")) {
    throw new Error("Please enter a valid linkedin.com profile URL.");
  }

  const match = u.pathname.match(/\/in\/([a-zA-Z0-9_-]+)/);
  if (!match) throw new Error("Use format: linkedin.com/in/your-name");

  const slug = match[1];
  return { slug, profileUrl: `https://www.linkedin.com/in/${slug}/` };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const connectLinkedIn = createServerFn({ method: "POST" }).handler(async (ctx: any) => {
  const profileUrl: string = ctx?.data?.profileUrl ?? "";
  const { slug, profileUrl: canonical } = parseLinkedInUrl(profileUrl);
  return {
    connected: true,
    slug,
    profileUrl: canonical,
    displayName: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  };
});
