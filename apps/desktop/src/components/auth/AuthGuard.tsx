import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useVaultStore } from "../../stores/useVaultStore";
import { SetupScreen } from "../../pages/auth/SetupScreen";
import { UnlockScreen } from "../../pages/auth/UnlockScreen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const initialize = useVaultStore((s) => s.initialize);
  const isInitialized = useVaultStore((s) => s.isInitialized);
  const isUnlocked = useVaultStore((s) => s.isUnlocked);
  const isLoading = useVaultStore((s) => s.isLoading);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Global Activity Tracking & Auto-Lock Interval
  useEffect(() => {
    if (!isUnlocked) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;
    const handleActivity = () => {
      if (timeout) return;
      timeout = setTimeout(() => {
        useVaultStore.getState().touchActivity();
        timeout = null;
      }, 1000);
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("pointerdown", handleActivity);

    const interval = setInterval(() => {
      useVaultStore.getState().checkAutoLock();
    }, 15000); // Check every 15 seconds

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("pointerdown", handleActivity);
      if (timeout) clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isUnlocked]);

  // Initial loading state while reading from LocalForage
  if (isLoading && !isInitialized && !isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app">
        <Loader2 size={32} className="text-accent animate-spin" />
      </div>
    );
  }

  // First-time setup
  if (!isInitialized) {
    return <SetupScreen />;
  }

  // Locked state
  if (!isUnlocked) {
    return <UnlockScreen />;
  }

  // Unlocked and ready
  return <>{children}</>;
}
