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
import { Box } from '@chakra-ui/react';

function App() {
  return (
    <>
       <Box
                position="fixed"
                inset={0}
                zIndex={-1}
                bg="#fff8e6"
                backgroundImage={`radial-gradient(rgba(255, 255, 255, 0.35) 1px, rgba(255, 255, 255, 0) 1px),
                  radial-gradient(rgba(0, 0, 0, 0.03) 1px, rgba(0, 0, 0, 0) 1px)`}
                backgroundPosition="0 0, 2px 2px"
                backgroundSize="8px 8px, 8px 8px"
                backgroundRepeat="repeat"
                backgroundAttachment="fixed"
                pointerEvents="none"
        />
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
    </>
  );
}

export default App;
