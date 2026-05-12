import { Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/auth/AuthGuard";
import { AppLayout } from "./components/layout/AppLayout";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { VaultPage } from "./pages/VaultPage";
import { FinderPage } from "./pages/FinderPage";
import { ExpiringPage } from "./pages/ExpiringPage";
import { SettingsPage } from "./pages/SettingsPage";

function App() {
  return (
    <ErrorBoundary>
      <AuthGuard>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/vault" replace />} />
            <Route path="/vault" element={<VaultPage />} />
            <Route path="/finder" element={<FinderPage />} />
            <Route path="/expiring" element={<ExpiringPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </AuthGuard>
    </ErrorBoundary>
  );
}

export default App;
