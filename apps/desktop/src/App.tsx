import { Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { VaultPage } from "./pages/VaultPage";
import { FinderPage } from "./pages/FinderPage";
import { ExpiringPage } from "./pages/ExpiringPage";
import { SettingsPage } from "./pages/SettingsPage";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<VaultPage />} />
        <Route path="/vault" element={<VaultPage />} />
        <Route path="/finder" element={<FinderPage />} />
        <Route path="/expiring" element={<ExpiringPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
