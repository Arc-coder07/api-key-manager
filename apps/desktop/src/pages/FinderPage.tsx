import { useState, useMemo, useEffect } from "react";
import { Search, ExternalLink, Plus, Sparkles, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ProviderIcon } from "../components/ui/ProviderIcon";
import { PROVIDERS } from "@vaultic/providers";
import { useVaultStore } from "../stores/useVaultStore";

export function FinderPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const incrementSearchCount = useVaultStore((s) => s.incrementSearchCount);
  const config = useVaultStore((s) => s.config);

  const maxSearches = 5;
  const searchesUsed = config?.finderSearchDate === new Date().toISOString().split("T")[0] 
                        ? (config.finderSearchCount || 0) 
                        : 0;

  // Rate limiting debounce tracker
  useEffect(() => {
    if (!query.trim()) return;
    const timeout = setTimeout(() => {
      incrementSearchCount();
    }, 800);
    return () => clearTimeout(timeout);
  }, [query, incrementSearchCount]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return PROVIDERS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query]);

  const showResults = query.trim().length > 0;
  const isLocked = searchesUsed >= maxSearches;

  return (
    <div className="flex flex-col h-full">
      <header className="px-8 py-5 border-b border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary">API Finder</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Discover APIs for your next project
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        {/* Search Hero */}
        <div className="max-w-2xl mx-auto space-y-6">
          {!showResults && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-accent/10 mb-4">
                <Sparkles size={28} className="text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary">
                Find the right API
              </h3>
              <p className="text-sm text-text-muted mt-1.5 max-w-md mx-auto">
                Search by use case — "free SMS API", "weather data", "AI image generation", or by provider name
              </p>
            </motion.div>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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

          <p className="text-xs text-text-muted text-center">
            {Math.max(0, maxSearches - searchesUsed)} searches remaining today ·{" "}
            <span className="text-accent cursor-pointer hover:text-accent-hover transition-colors">
              Upgrade for unlimited
            </span>
          </p>

          {/* Results */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3 mt-4 relative"
            >
              {isLocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center pt-24 bg-card/60 backdrop-blur-[2px] rounded-xl border border-border-subtle">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
                    <Lock size={28} className="text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">Daily Limit Reached</h3>
                  <p className="text-sm text-text-secondary text-center max-w-md px-4">
                    You've hit the maximum 5 searches per day on the free tier. 
                    Upgrade to Premium for unlimited API directory access.
                  </p>
                  <button className="mt-6 px-6 py-2.5 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover shadow-glow">
                    Upgrade to Premium
                  </button>
                </div>
              )}
              <p className="text-xs text-text-muted">
                {results.length} {results.length === 1 ? "result" : "results"} found
              </p>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-text-secondary">No APIs found for "{query}"</p>
                  <p className="text-xs text-text-muted mt-1">Try a different search term</p>
                </div>
              ) : (
                results.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border-subtle hover:bg-card-hover hover:border-border-active transition-all"
                  >
                    <ProviderIcon provider={provider.id} size={40} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-medium text-text-primary">
                          {provider.name}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-xxs bg-border-subtle/50 text-text-muted capitalize">
                          {provider.category}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {provider.description}
                      </p>
                      {provider.freeTier && (
                        <p className="text-xs text-accent mt-1">
                          Free tier: {provider.freeTier}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <a
                        href={provider.signupUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors"
                      >
                        <ExternalLink size={11} />
                        Sign Up
                      </a>
                      <button 
                        onClick={() => !isLocked && navigate('/vault', { state: { draftProvider: provider.id } })}
                        disabled={isLocked}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-subtle text-text-muted text-xs hover:text-text-secondary hover:border-border-active transition-colors disabled:opacity-50"
                      >
                        <Plus size={11} />
                        Add to Vault
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
