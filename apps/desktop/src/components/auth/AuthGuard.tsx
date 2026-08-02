import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useVaultStore } from "../../stores/useVaultStore";
import { OnboardingScreen } from "../../pages/auth/OnboardingScreen";
import { UnlockScreen } from "../../pages/auth/UnlockScreen";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const initialize = useVaultStore((s) => s.initialize);
  const isInitialized = useVaultStore((s) => s.isInitialized);
  const isUnlocked = useVaultStore((s) => s.isUnlocked);
  const isLoading = useVaultStore((s) => s.isLoading);
  const config = useVaultStore((s) => s.config);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Global Activity Tracking & Auto-Lock Interval
  // Only active when password is enabled
  useEffect(() => {
    if (!isUnlocked) return;
    if (!config?.passwordEnabled) return; // No auto-lock without password

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
  }, [isUnlocked, config?.passwordEnabled]);

  // Initial loading state while reading from LocalForage
  if (isLoading && !isInitialized && !isUnlocked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-app">
        <Loader2 size={32} className="text-accent animate-spin" />
      </div>
    );
  }

  // First-time setup — show onboarding (no password needed)
  if (!isInitialized) {
    return <OnboardingScreen />;
  }

  // Locked state — only shown when password is enabled
  if (!isUnlocked) {
    return <UnlockScreen />;
  }

  // Unlocked and ready
  return <>{children}</>;
}
