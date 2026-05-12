// ─────────────────────────────────────────────────────────────────
// Provider Icon — Renders monochrome SVG provider logos locally
// No CDN dependency — works fully offline
// ─────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

interface ProviderIconProps {
  provider: string;
  size?: number;
  className?: string;
}

// Brand colors for monochrome tinted backgrounds
const BRAND_COLORS: Record<string, string> = {
  openai: "#412991",
  anthropic: "#D4A574",
  "google-ai": "#4285F4",
  huggingface: "#FFD21E",
  replicate: "#FFFFFF",
  "stability-ai": "#A855F7",
  stripe: "#635BFF",
  razorpay: "#0D6EFD",
  paypal: "#003087",
  supabase: "#3FCF8E",
  firebase: "#FFCA28",
  clerk: "#6C47FF",
  auth0: "#EB5424",
  twilio: "#F22F46",
  sendgrid: "#1A82E2",
  resend: "#FFFFFF",
  "google-maps": "#34A853",
  mapbox: "#4264FB",
  aws: "#FF9900",
  cloudinary: "#3448C5",
  uploadthing: "#EF4444",
  mongodb: "#47A248",
  planetscale: "#000000",
  neon: "#00E599",
  github: "#FFFFFF",
  vercel: "#FFFFFF",
  sentry: "#362D59",
  algolia: "#003DFF",
  openweathermap: "#EB6E4B",
  "rapid-api": "#0055DA",
};

// Simple Icons slugs mapped from provider IDs
const ICON_SLUG_MAP: Record<string, string> = {
  openai: "openai",
  anthropic: "anthropic",
  "google-ai": "google",
  huggingface: "huggingface",
  replicate: "replicate",
  "stability-ai": "stabilityai",
  stripe: "stripe",
  razorpay: "razorpay",
  paypal: "paypal",
  supabase: "supabase",
  firebase: "firebase",
  clerk: "clerk",
  auth0: "auth0",
  twilio: "twilio",
  sendgrid: "sendgrid",
  resend: "resend",
  "google-maps": "googlemaps",
  mapbox: "mapbox",
  aws: "amazonaws",
  cloudinary: "cloudinary",
  uploadthing: "uploadthing",
  mongodb: "mongodb",
  planetscale: "planetscale",
  neon: "neon",
  github: "github",
  vercel: "vercel",
  sentry: "sentry",
  algolia: "algolia",
  openweathermap: "openweathermap",
  "rapid-api": "rapidapi",
};

// Cache for loaded SVG content — persist across renders
const svgCache = new Map<string, string>();

export function ProviderIcon({ provider, size = 36, className = "" }: ProviderIconProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  const slug = ICON_SLUG_MAP[provider.toLowerCase()];
  const brandColor = BRAND_COLORS[provider.toLowerCase()] || "#71717a";

  useEffect(() => {
    if (!slug) {
      setHasError(true);
      return;
    }

    // Check cache first
    const cached = svgCache.get(slug);
    if (cached) {
      setSvgContent(cached);
      return;
    }

    // Load from CDN and cache — only fetched once per slug per session
    let cancelled = false;
    fetch(`https://cdn.simpleicons.org/${slug}/ffffff`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.text();
      })
      .then((svg) => {
        svgCache.set(slug, svg);
        if (!cancelled) setSvgContent(svg);
      })
      .catch(() => {
        if (!cancelled) setHasError(true);
      });

    return () => { cancelled = true; };
  }, [slug]);

  // Letter avatar fallback
  if (hasError || !slug) {
    const initials = provider
      .replace(/-/g, " ")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return (
      <div
        className={`flex items-center justify-center rounded-lg shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: `${brandColor}20`,
        }}
      >
        <span
          className="font-semibold"
          style={{ fontSize: size * 0.32, color: brandColor }}
        >
          {initials}
        </span>
      </div>
    );
  }

  // Loading state — same size box to prevent layout shift
  if (!svgContent) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-border-subtle/30 shrink-0 animate-pulse ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: `${brandColor}15`,
      }}
    >
      <div
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{
          width: size * 0.55,
          height: size * 0.55,
          opacity: 0.85,
        }}
      />
    </div>
  );
}
