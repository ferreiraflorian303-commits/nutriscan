import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { Login } from "./pages/Login";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Scan } from "./pages/Scan";
import { History } from "./pages/History";
import { Weight } from "./pages/Weight";
import { ProfilePage } from "./pages/ProfilePage";
import { BottomNav } from "./components/BottomNav";

function Gate() {
  const { loading, authenticated, profile } = useApp();

  if (loading) {
    return <div className="flex h-full items-center justify-center text-slate-400">Chargement...</div>;
  }

  if (!authenticated) {
    return <Login />;
  }

  if (!profile) {
    return <Onboarding />;
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/history" element={<History />} />
        <Route path="/weight" element={<Weight />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Gate />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
