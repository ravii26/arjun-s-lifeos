import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Focus from "./pages/Focus";
import { VaultPlaceholder, LearnPlaceholder, ReviewPlaceholder, AreaDetailPlaceholder } from "./pages/Placeholders";

const App = () => (
  <AppProvider>
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/vault" element={<VaultPlaceholder />} />
          <Route path="/learn" element={<LearnPlaceholder />} />
          <Route path="/review" element={<ReviewPlaceholder />} />
          <Route path="/areas/:id" element={<AreaDetailPlaceholder />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  </AppProvider>
);

export default App;
