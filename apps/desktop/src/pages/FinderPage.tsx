import { Search, ExternalLink, Plus } from "lucide-react";

export function FinderPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-8 py-5 border-b border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary">API Finder</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Discover APIs for your next project
        </p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-xl text-center space-y-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-accent/10">
            <Search size={28} className="text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">
              Find the right API
            </h3>
            <p className="text-sm text-text-muted mt-1">
              Search for APIs by use case — "free SMS API", "weather data", "send emails"
            </p>
          </div>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="What kind of API do you need?"
              className="
                w-full pl-12 pr-4 py-3.5 rounded-xl
                bg-card border border-border-subtle
                text-base text-text-primary placeholder-text-muted
                focus:outline-none focus:border-accent/50 focus:shadow-glow
                transition-all duration-200
              "
            />
          </div>
          <p className="text-xs text-text-muted">
            5 searches remaining today · <span className="text-accent">Upgrade for unlimited</span>
          </p>
        </div>
      </div>
    </div>
  );
}
