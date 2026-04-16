import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Shell } from "./components/Shell";
import { Dashboard } from "./screens/Dashboard";
import { Focus } from "./screens/Focus";
import { AreaDetails } from "./screens/AreaDetails";
import { PlaceholderPage } from "./screens/PlaceholderPage";
import { Vault } from "./screens/Vault";
import { Learn } from "./screens/Learn";
import { Review } from "./screens/Review";
import { TopicPage } from "./screens/TopicPage";
import { Statistics } from "./screens/Statistics";
import { BarChart3, Shield } from "lucide-react";

const App = () => (
  <AppProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Shell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/review" element={<Review />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/topics/:id" element={<TopicPage />} />
          <Route path="/areas/:id" element={<AreaDetails />} />
          <Route path="*" element={<PlaceholderPage title="Not Found" note="This page is not part of your LifeOS flow yet." Icon={Shield} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AppProvider>
);

export default App;
