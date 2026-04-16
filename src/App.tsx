import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { Shell } from '@/components/Shell';
import { Dashboard } from '@/featureScreens/Dashboard';
import { Focus } from '@/featureScreens/Focus';
import { Habits } from '@/screens/Habits';
import { Learn } from '@/featureScreens/Learn';
import { Review } from '@/featureScreens/Review';
import { Vault } from '@/featureScreens/Vault';
import { AreaDetail } from '@/featureScreens/AreaDetail';
import { HabitDetailBridge as HabitDetail } from '@/featureScreens/HabitDetailBridge';
import { NewHabitFlow } from '@/featureScreens/NewHabitFlow';

const App = () => (
  <AppProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/habits/new" element={<NewHabitFlow />} />
        <Route element={<Shell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/focus" element={<Focus />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/habits/:id" element={<HabitDetail />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/review" element={<Review />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/areas/:id" element={<AreaDetail />} />
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AppProvider>
);

export default App;
