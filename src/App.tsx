import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AppLayout } from "./components/AppLayout";
import "./styles/lifeos-polish.css";
import Dashboard from "./components/Dashboard";
import Tasks from "./components/Tasks";
import Habits from "./components/Habits";
import Calendar from "./components/Calendar";
import Learn from "./components/Learn";
import Areas from "./components/Areas";
import Vault from "./components/Vault";
import Dump from "./components/Dump";
import Settings from "./components/Settings";

const App = () => (
  <AppProvider>
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/dump" element={<Dump />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  </AppProvider>
);

export default App;
