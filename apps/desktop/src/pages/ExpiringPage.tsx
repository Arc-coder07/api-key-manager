import { Clock, AlertTriangle } from "lucide-react";

export function ExpiringPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-8 py-5 border-b border-border-subtle">
        <h2 className="text-lg font-semibold text-text-primary">Expiring Keys</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Keys expiring within the next 30 days
        </p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-status-amber/10">
            <Clock size={28} className="text-status-amber" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-text-primary">
              All clear
            </h3>
            <p className="text-sm text-text-muted mt-1">
              No keys are expiring soon. You're all set!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
