import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  searchPlaceholder?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  label,
  searchPlaceholder = "Search...",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase()) ||
      opt.value.toLowerCase().includes(query.toLowerCase()) ||
      (opt.description && opt.description.toLowerCase().includes(query.toLowerCase()))
  );

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between w-full px-3 py-2.5 rounded-lg
          bg-card border text-sm text-left
          transition-colors duration-150
          ${isOpen ? "border-accent/50" : "border-border-subtle hover:border-border-active"}
        `}
      >
        <span className={selectedOption ? "text-text-primary" : "text-text-muted"}>
          {selectedOption ? (
            <span className="flex items-center gap-2">
              {selectedOption.icon}
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          size={14}
          className={`text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full rounded-xl bg-sidebar border border-border-subtle shadow-xl overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-border-subtle">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-card border border-border-subtle text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50"
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-48 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-text-muted">No results</p>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`
                      flex items-center gap-2.5 w-full px-3 py-2 text-sm text-left
                      transition-colors duration-100
                      ${
                        opt.value === value
                          ? "bg-accent/10 text-accent"
                          : "text-text-secondary hover:bg-card hover:text-text-primary"
                      }
                    `}
                  >
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <div className="flex-1 min-w-0">
                      <span className="block truncate">{opt.label}</span>
                      {opt.description && (
                        <span className="block text-xxs text-text-muted truncate">
                          {opt.description}
                        </span>
                      )}
                    </div>
                    {opt.value === value && <Check size={14} className="text-accent shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
