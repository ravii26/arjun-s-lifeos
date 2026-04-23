import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AppLayout } from "./components/AppLayout";
import "./styles/lifeos-polish.css";
import Dashboard from "./components/Dashboard";
import Tasks from "./components/Tasks";
import Habits from "./components/Habits";
import Calendar from "./components/Calendar";
import Learn from "./components/Learn";
import LearnDetail from "./components/LearnDetail";
import Areas from "./components/Areas";
import AreaDetail from "./components/AreaDetail";
import Vault from "./components/Vault";
import Dump from "./components/Dump";
import Settings from "./components/Settings";

// New Flow Components
import Auth from "./components/Auth";
import Onboarding from "./components/Onboarding";
import DesignSystem from "./components/DesignSystem";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('lifeos_auth') === 'true'
  );

  const handleAuthSuccess = (hasOnboarded: boolean) => {
    setIsAuthenticated(true);
  };

  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public / Fullscreen Flows */}
          <Route path="/login" element={<Auth onAuthSuccess={handleAuthSuccess} />} />
          <Route path="/onboarding" element={<Onboarding onComplete={() => setIsAuthenticated(true)} />} />
          <Route path="/design" element={<DesignSystem />} />

          {/* Protected Main Workspace */}
          <Route path="/*" element={
            isAuthenticated ? (
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/habits" element={<Habits />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/learn" element={<Learn />} />
                  <Route path="/learn/:entityType/:entityId" element={<LearnDetail />} />
                  <Route path="/areas" element={<Areas />} />
                  <Route path="/areas/:areaKey" element={<AreaDetail />} />
                  <Route path="/vault" element={<Vault />} />
                  <Route path="/dump" element={<Dump />} />
                  <Route path="/settings" element={<Settings onLogout={() => setIsAuthenticated(false)} />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
