import { Route, Routes }from 'react-router-dom';
import Home from './pages/Home';
import Registry from './pages/Registry';
import Schedule from './pages/Schedule';
import Rsvp from './pages/Rsvp';
import Gallery from './pages/Gallery';
import WeddingParty from './pages/WeddingParty';
import Qa from './pages/Qa';
import Travel from './pages/Travel';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './componets/ProtectedRoute';
import NotFound from './pages/NotFound';

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/registry" element={<Registry />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/rsvp" element={<Rsvp />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/wedding-party" element={<WeddingParty />} />
        <Route path="/qa" element={<Qa />} />
        <Route path="/travel" element={<Travel />} />

        {/* Admin login (public) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute />}>
          <Route index element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
