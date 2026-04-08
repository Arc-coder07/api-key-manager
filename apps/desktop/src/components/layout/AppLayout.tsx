import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
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
