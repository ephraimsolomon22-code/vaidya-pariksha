import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import ProtocolSetup from './pages/ProtocolSetup';
import Trials from './pages/Trials';
import Ethics from './pages/Ethics';
import Sites from './pages/Sites';
import Participants from './pages/Participants';
import Visits from './pages/Visits';
import Safety from './pages/Safety';
import DataQuality from './pages/DataQuality';
import RiskCopilot from './pages/RiskCopilot';
import Analytics from './pages/Analytics';
import ExportPage from './pages/Export';
import Audit from './pages/Audit';

export default function App() {
  const { profile, loading } = useAuth();

  if (loading) return <div className="p-8 text-sm text-muted">Loading…</div>;
  if (!profile) return <Login />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="protocol" element={<ProtocolSetup />} />
        <Route path="trials" element={<Trials />} />
        <Route path="ethics" element={<Ethics />} />
        <Route path="sites" element={<Sites />} />
        <Route path="participants" element={<Participants />} />
        <Route path="visits" element={<Visits />} />
        <Route path="safety" element={<Safety />} />
        <Route path="data-quality" element={<DataQuality />} />
        <Route path="risk" element={<RiskCopilot />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="export" element={<ExportPage />} />
        <Route path="audit" element={<Audit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
