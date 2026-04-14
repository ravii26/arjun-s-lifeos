import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Focus from "./pages/Focus";
import Vault from "./pages/Vault";
import Learn from "./pages/Learn";
import Review from "./pages/Review";
import AreaDetail from "./pages/AreaDetail";
import NotFound from "./pages/NotFound";

const App = () => (
  <AppProvider>
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/review" element={<Review />} />
          <Route path="/areas/:id" element={<AreaDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  </AppProvider>
);

export default App;
