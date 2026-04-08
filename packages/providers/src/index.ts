// ─────────────────────────────────────────────────────────────────
// @vaultic/providers — API Provider Database
// ─────────────────────────────────────────────────────────────────
// A curated database of 30+ common API providers with metadata
// for auto-fill, .env import detection, and the API Finder.

import type { ApiCategory } from '@vaultic/types';

export interface Provider {
  /** Unique slug, e.g. "openai" */
  id: string;
  /** Display name, e.g. "OpenAI" */
  name: string;
  /** Default API category */
  category: ApiCategory;
  /** URL to provider's API key management dashboard */
  dashboardUrl: string;
  /** URL to provider's signup page */
  signupUrl: string;
  /** Short description of the API */
  description: string;
  /** What the free tier includes (null if no free tier) */
  freeTier: string | null;
  /** Regex patterns to match .env key names for this provider */
  envKeyPatterns: string[];
}

export const PROVIDERS: Provider[] = [
  // ── AI & ML ─────────────────────────────────────────────────
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    dashboardUrl: 'https://platform.openai.com/api-keys',
    signupUrl: 'https://platform.openai.com/signup',
    description: 'GPT-4, DALL·E, Whisper — the leading AI/LLM API platform.',
    freeTier: '$5 free credits for new accounts',
    envKeyPatterns: ['OPENAI_API_KEY', 'OPENAI_KEY'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'ai',
    dashboardUrl: 'https://console.anthropic.com/settings/keys',
    signupUrl: 'https://console.anthropic.com/',
    description: 'Claude AI models — advanced reasoning and analysis.',
    freeTier: '$5 free credits for new accounts',
    envKeyPatterns: ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY'],
  },
  {
    id: 'google-ai',
    name: 'Google AI (Gemini)',
    category: 'ai',
    dashboardUrl: 'https://aistudio.google.com/app/apikey',
    signupUrl: 'https://aistudio.google.com/',
    description: 'Gemini models — multimodal AI from Google DeepMind.',
    freeTier: 'Free tier with generous rate limits',
    envKeyPatterns: ['GOOGLE_AI_API_KEY', 'GEMINI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY'],
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    category: 'ai',
    dashboardUrl: 'https://huggingface.co/settings/tokens',
    signupUrl: 'https://huggingface.co/join',
    description: 'Open-source ML models, datasets, and inference APIs.',
    freeTier: 'Free inference API with rate limits',
    envKeyPatterns: ['HUGGINGFACE_API_KEY', 'HF_TOKEN', 'HUGGINGFACE_TOKEN'],
  },
  {
    id: 'replicate',
    name: 'Replicate',
    category: 'ai',
    dashboardUrl: 'https://replicate.com/account/api-tokens',
    signupUrl: 'https://replicate.com/',
    description: 'Run open-source ML models in the cloud via API.',
    freeTier: 'Free for some predictions',
    envKeyPatterns: ['REPLICATE_API_TOKEN', 'REPLICATE_API_KEY'],
  },
  {
    id: 'stability-ai',
    name: 'Stability AI',
    category: 'ai',
    dashboardUrl: 'https://platform.stability.ai/account/keys',
    signupUrl: 'https://platform.stability.ai/',
    description: 'Stable Diffusion image generation API.',
    freeTier: '25 free credits on signup',
    envKeyPatterns: ['STABILITY_API_KEY'],
  },

  // ── Payments ────────────────────────────────────────────────
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'payments',
    dashboardUrl: 'https://dashboard.stripe.com/apikeys',
    signupUrl: 'https://dashboard.stripe.com/register',
    description: 'Payment processing, subscriptions, and billing.',
    freeTier: 'Free to test; pay-per-transaction in production',
    envKeyPatterns: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_API_KEY', 'STRIPE_WEBHOOK_SECRET'],
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    category: 'payments',
    dashboardUrl: 'https://dashboard.razorpay.com/app/website-app-settings/api-keys',
    signupUrl: 'https://dashboard.razorpay.com/signup',
    description: 'Payment gateway popular in India — UPI, cards, netbanking.',
    freeTier: 'Free test mode; 2% transaction fee in production',
    envKeyPatterns: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'payments',
    dashboardUrl: 'https://developer.paypal.com/dashboard/applications',
    signupUrl: 'https://developer.paypal.com/',
    description: 'Global payment platform with checkout, subscriptions, and payouts.',
    freeTier: 'Free sandbox; pay-per-transaction in production',
    envKeyPatterns: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
  },

  // ── Auth ────────────────────────────────────────────────────
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'auth',
    dashboardUrl: 'https://supabase.com/dashboard/project/_/settings/api',
    signupUrl: 'https://supabase.com/dashboard/sign-up',
    description: 'Open-source Firebase alternative — auth, database, storage, edge functions.',
    freeTier: '2 free projects, 500MB database, 1GB storage',
    envKeyPatterns: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  },
  {
    id: 'firebase',
    name: 'Firebase',
    category: 'auth',
    dashboardUrl: 'https://console.firebase.google.com/project/_/settings/general/',
    signupUrl: 'https://firebase.google.com/',
    description: 'Google\'s app platform — auth, Firestore, hosting, cloud functions.',
    freeTier: 'Generous free tier (Spark plan)',
    envKeyPatterns: ['FIREBASE_API_KEY', 'FIREBASE_PROJECT_ID', 'FIREBASE_AUTH_DOMAIN'],
  },
  {
    id: 'clerk',
    name: 'Clerk',
    category: 'auth',
    dashboardUrl: 'https://dashboard.clerk.com/',
    signupUrl: 'https://clerk.com/sign-up',
    description: 'Drop-in authentication & user management for React/Next.js.',
    freeTier: '10,000 monthly active users free',
    envKeyPatterns: ['CLERK_SECRET_KEY', 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'CLERK_PUBLISHABLE_KEY'],
  },
  {
    id: 'auth0',
    name: 'Auth0',
    category: 'auth',
    dashboardUrl: 'https://manage.auth0.com/dashboard/',
    signupUrl: 'https://auth0.com/signup',
    description: 'Identity platform — SSO, MFA, social login.',
    freeTier: '7,500 monthly active users free',
    envKeyPatterns: ['AUTH0_SECRET', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'AUTH0_DOMAIN'],
  },

  // ── Messaging ───────────────────────────────────────────────
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'messaging',
    dashboardUrl: 'https://console.twilio.com/',
    signupUrl: 'https://www.twilio.com/try-twilio',
    description: 'SMS, voice, video, and WhatsApp APIs.',
    freeTier: '$15 free trial credit',
    envKeyPatterns: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'email',
    dashboardUrl: 'https://app.sendgrid.com/settings/api_keys',
    signupUrl: 'https://signup.sendgrid.com/',
    description: 'Transactional and marketing email delivery.',
    freeTier: '100 emails/day free forever',
    envKeyPatterns: ['SENDGRID_API_KEY'],
  },
  {
    id: 'resend',
    name: 'Resend',
    category: 'email',
    dashboardUrl: 'https://resend.com/api-keys',
    signupUrl: 'https://resend.com/signup',
    description: 'Modern email API built for developers. React Email support.',
    freeTier: '3,000 emails/month, 100 emails/day',
    envKeyPatterns: ['RESEND_API_KEY'],
  },

  // ── Maps & Location ─────────────────────────────────────────
  {
    id: 'google-maps',
    name: 'Google Maps',
    category: 'maps',
    dashboardUrl: 'https://console.cloud.google.com/google/maps-apis/credentials',
    signupUrl: 'https://cloud.google.com/',
    description: 'Maps, geocoding, directions, and Places API.',
    freeTier: '$200/month free credit',
    envKeyPatterns: ['GOOGLE_MAPS_API_KEY', 'NEXT_PUBLIC_GOOGLE_MAPS_KEY'],
  },
  {
    id: 'mapbox',
    name: 'Mapbox',
    category: 'maps',
    dashboardUrl: 'https://account.mapbox.com/access-tokens/',
    signupUrl: 'https://account.mapbox.com/auth/signup/',
    description: 'Custom maps, navigation, and location search.',
    freeTier: '50,000 map loads/month',
    envKeyPatterns: ['MAPBOX_ACCESS_TOKEN', 'MAPBOX_TOKEN'],
  },

  // ── Storage & Cloud ─────────────────────────────────────────
  {
    id: 'aws',
    name: 'Amazon Web Services',
    category: 'cloud',
    dashboardUrl: 'https://console.aws.amazon.com/iam/home#/security_credentials',
    signupUrl: 'https://aws.amazon.com/free/',
    description: 'The largest cloud platform — S3, Lambda, EC2, and 200+ services.',
    freeTier: '12 months free tier for many services',
    envKeyPatterns: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary',
    category: 'storage',
    dashboardUrl: 'https://console.cloudinary.com/settings/api-keys',
    signupUrl: 'https://cloudinary.com/users/register_free',
    description: 'Image and video management, optimization, and delivery.',
    freeTier: '25 credits/month (≈25GB storage)',
    envKeyPatterns: ['CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_URL'],
  },
  {
    id: 'uploadthing',
    name: 'UploadThing',
    category: 'storage',
    dashboardUrl: 'https://uploadthing.com/dashboard',
    signupUrl: 'https://uploadthing.com/',
    description: 'Simple file uploads for Next.js applications.',
    freeTier: '2GB storage, 2GB bandwidth/month',
    envKeyPatterns: ['UPLOADTHING_SECRET', 'UPLOADTHING_APP_ID'],
  },

  // ── Database ────────────────────────────────────────────────
  {
    id: 'mongodb',
    name: 'MongoDB Atlas',
    category: 'database',
    dashboardUrl: 'https://cloud.mongodb.com/',
    signupUrl: 'https://account.mongodb.com/account/register',
    description: 'Cloud-hosted MongoDB — the most popular NoSQL database.',
    freeTier: '512MB storage, shared cluster',
    envKeyPatterns: ['MONGODB_URI', 'MONGO_URI', 'DATABASE_URL'],
  },
  {
    id: 'planetscale',
    name: 'PlanetScale',
    category: 'database',
    dashboardUrl: 'https://app.planetscale.com/',
    signupUrl: 'https://auth.planetscale.com/sign-up',
    description: 'Serverless MySQL-compatible database with branching.',
    freeTier: '5GB storage, 1 billion row reads/month',
    envKeyPatterns: ['DATABASE_URL'],
  },
  {
    id: 'neon',
    name: 'Neon',
    category: 'database',
    dashboardUrl: 'https://console.neon.tech/',
    signupUrl: 'https://console.neon.tech/signup',
    description: 'Serverless Postgres with autoscaling and branching.',
    freeTier: '512MB storage, autosuspend after 5min',
    envKeyPatterns: ['DATABASE_URL', 'NEON_DATABASE_URL'],
  },

  // ── Dev Tools ───────────────────────────────────────────────
  {
    id: 'github',
    name: 'GitHub',
    category: 'devtools',
    dashboardUrl: 'https://github.com/settings/tokens',
    signupUrl: 'https://github.com/signup',
    description: 'Personal access tokens for GitHub API — repos, actions, packages.',
    freeTier: 'Free for public repos; 2,000 Actions minutes/month',
    envKeyPatterns: ['GITHUB_TOKEN', 'GITHUB_API_KEY', 'GH_TOKEN'],
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'cloud',
    dashboardUrl: 'https://vercel.com/account/tokens',
    signupUrl: 'https://vercel.com/signup',
    description: 'Frontend cloud platform — deploy Next.js and other frameworks.',
    freeTier: 'Free hobby tier with 100GB bandwidth',
    envKeyPatterns: ['VERCEL_TOKEN', 'VERCEL_API_TOKEN'],
  },
  {
    id: 'sentry',
    name: 'Sentry',
    category: 'analytics',
    dashboardUrl: 'https://sentry.io/settings/account/api/auth-tokens/',
    signupUrl: 'https://sentry.io/signup/',
    description: 'Error tracking and performance monitoring.',
    freeTier: '5,000 errors/month, 10,000 transactions/month',
    envKeyPatterns: ['SENTRY_DSN', 'SENTRY_AUTH_TOKEN', 'NEXT_PUBLIC_SENTRY_DSN'],
  },
  {
    id: 'algolia',
    name: 'Algolia',
    category: 'search',
    dashboardUrl: 'https://dashboard.algolia.com/account/api-keys/',
    signupUrl: 'https://www.algolia.com/users/sign_up',
    description: 'Lightning-fast search-as-a-service API.',
    freeTier: '10,000 search requests/month',
    envKeyPatterns: ['ALGOLIA_APP_ID', 'ALGOLIA_API_KEY', 'ALGOLIA_SEARCH_KEY', 'NEXT_PUBLIC_ALGOLIA_APP_ID'],
  },
  {
    id: 'openweathermap',
    name: 'OpenWeatherMap',
    category: 'other',
    dashboardUrl: 'https://home.openweathermap.org/api_keys',
    signupUrl: 'https://home.openweathermap.org/users/sign_up',
    description: 'Weather data API — current, forecast, historical, and alerts.',
    freeTier: '1,000 API calls/day, current weather + 3-hour forecast',
    envKeyPatterns: ['OPENWEATHERMAP_API_KEY', 'WEATHER_API_KEY'],
  },
  {
    id: 'rapid-api',
    name: 'RapidAPI',
    category: 'other',
    dashboardUrl: 'https://rapidapi.com/developer/dashboard',
    signupUrl: 'https://rapidapi.com/auth/sign-up',
    description: 'API marketplace — discover and connect to thousands of APIs.',
    freeTier: 'Many APIs have free tiers',
    envKeyPatterns: ['RAPIDAPI_KEY', 'X_RAPIDAPI_KEY'],
  },
];

/**
 * Find a provider by slug ID.
 */
export function getProvider(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

/**
 * Guess the provider from an .env key name.
 * Returns the first matching provider, or undefined.
 */
export function guessProviderFromEnvKey(envKeyName: string): Provider | undefined {
  const upperName = envKeyName.toUpperCase();
  return PROVIDERS.find((p) =>
    p.envKeyPatterns.some((pattern) => upperName.includes(pattern) || upperName === pattern)
  );
}

/**
 * Search providers by query string.
 * Matches against name, description, and category.
 */
export function searchProviders(query: string): Provider[] {
  const lowerQuery = query.toLowerCase();
  return PROVIDERS.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
  );
}
