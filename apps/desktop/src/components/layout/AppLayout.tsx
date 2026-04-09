import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useVaultStore } from "../../stores/useVaultStore";

export function AppLayout() {
  const touchActivity = useVaultStore((s) => s.touchActivity);
  const checkAutoLock = useVaultStore((s) => s.checkAutoLock);

  useEffect(() => {
    const handleActivity = () => touchActivity();
    
    window.addEventListener("mousemove", handleActivity, { passive: true });
    window.addEventListener("keydown", handleActivity, { passive: true });
    window.addEventListener("click", handleActivity, { passive: true });

    const interval = setInterval(checkAutoLock, 60000);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      clearInterval(interval);
    };
  }, [touchActivity, checkAutoLock]);
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-app">
      {/* ─── Fixed Sidebar ─────────────────────────────── */}
      <Sidebar />

      {/* ─── Main Content Area ────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
