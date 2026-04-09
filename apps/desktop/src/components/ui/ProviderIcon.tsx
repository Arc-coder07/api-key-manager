// ─────────────────────────────────────────────────────────────────
// Provider Icon — Renders provider logos from Simple Icons CDN
// Falls back to a styled letter avatar if the icon fails to load
// ─────────────────────────────────────────────────────────────────

import { useState } from "react";

interface ProviderIconProps {
  provider: string;
  size?: number;
  className?: string;
}

// Map provider slugs to Simple Icons slugs
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

// Provider brand colors for letter avatar fallback
const PROVIDER_COLORS: Record<string, string> = {
  openai: "#412991",
  anthropic: "#D4A574",
  "google-ai": "#4285F4",
  stripe: "#635BFF",
  supabase: "#3FCF8E",
  firebase: "#FFCA28",
  twilio: "#F22F46",
  github: "#FFFFFF",
  aws: "#FF9900",
  vercel: "#FFFFFF",
  mongodb: "#47A248",
  resend: "#FFFFFF",
  sendgrid: "#1A82E2",
  clerk: "#6C47FF",
};

export function ProviderIcon({ provider, size = 36, className = "" }: ProviderIconProps) {
  const [hasError, setHasError] = useState(false);
  const slug = ICON_SLUG_MAP[provider.toLowerCase()] || provider.toLowerCase();
  const iconUrl = `https://cdn.simpleicons.org/${slug}/ffffff`;

  if (hasError || !ICON_SLUG_MAP[provider.toLowerCase()]) {
    // Letter avatar fallback
    const initials = provider
      .replace(/-/g, " ")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const bgColor = PROVIDER_COLORS[provider.toLowerCase()] || "#3a3a42";

    return (
      <div
        className={`flex items-center justify-center rounded-lg shrink-0 ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: `${bgColor}20`,
        }}
      >
        <span
          className="font-semibold text-text-secondary"
          style={{ fontSize: size * 0.32 }}
        >
          {initials}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-border-subtle/30 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={iconUrl}
        alt={`${provider} icon`}
        width={size * 0.55}
        height={size * 0.55}
        className="opacity-80"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
