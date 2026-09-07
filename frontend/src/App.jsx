import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import BottomDock from './components/BottomDock';

import LandingPage from './pages/LandingPage';
import TouristDashboard from './pages/TouristDashboard';
import TouristRegister from './pages/TouristRegister';
import LoginPage from './pages/LoginPage';
import TouristVerifyPage from './pages/TouristVerifyPage';
import VerifyDigitalIdPage from './pages/VerifyDigitalIdPage';
import AuthorityDashboard from './pages/AuthorityDashboard';
import GeoFenceManagementPage from './pages/GeoFenceManagementPage';
import IncidentManagementPage from './pages/IncidentManagementPage';
import BlockchainLedgerPage from './pages/BlockchainLedgerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PrivacyCompliancePage from './pages/PrivacyCompliancePage';
import VendorMarketplacePage from './pages/VendorMarketplacePage';

// Dedicated New Pages for Every Button
import DigitalIdPage from './pages/DigitalIdPage';
import SosPage from './pages/SosPage';
import FaresPage from './pages/FaresPage';
import EmergencyHelpPage from './pages/EmergencyHelpPage';
import DeadmanSwitchPage from './pages/DeadmanSwitchPage';

import PatrioticLoader from './components/PatrioticLoader';
import OfflineGhostMeshModal from './components/OfflineGhostMeshModal';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [showPatrioticLoader, setShowPatrioticLoader] = useState(() => {
    try {
      return !sessionStorage.getItem('safar_loader_shown');
    } catch {
      return true;
    }
  });
  const [showMeshModal, setShowMeshModal] = useState(false);

  // Authenticated user recovered from localStorage or initialized as null
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('safar_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [touristProfile, setTouristProfile] = useState(null);
  const [digitalId, setDigitalId] = useState(null);
  const [allTourists, setAllTourists] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [activeSosIncident, setActiveSosIncident] = useState(null);

  // Initial Authentication & Data Recovery on Refresh
  useEffect(() => {
    initAppSession();
  }, []);

  const initAppSession = async () => {
    const token = localStorage.getItem('safar_token');
    let verifiedUser = null;

    if (token) {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          verifiedUser = data.user;
          setCurrentUser(data.user);
          localStorage.setItem('safar_user', JSON.stringify(data.user));
          if (data.tourist) setTouristProfile(data.tourist);
          if (data.digitalId) setDigitalId(data.digitalId);
        } else {
          // Token is expired or invalid: clear session
          localStorage.removeItem('safar_token');
          localStorage.removeItem('safar_user');
          setCurrentUser(null);
          setTouristProfile(null);
          setDigitalId(null);
        }
      } catch (err) {
        console.error('Session verification error:', err);
      }
    } else {
      // No token found: do NOT auto-assign any default identity
      setCurrentUser(null);
      setTouristProfile(null);
      setDigitalId(null);
    }

    await fetchInitialData(verifiedUser);
  };

  const fetchInitialData = async (activeUser) => {
    try {
      const token = localStorage.getItem('safar_token');
      const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

      // 1. Fetch Tourists
      const resT = await fetch('/api/tourists', { headers: authHeaders });
      const dataT = await resT.json();
      if (dataT.success) {
        setAllTourists(dataT.tourists);
        const targetUser = activeUser || currentUser;
        if (targetUser && targetUser.touristId) {
          const myProfile = dataT.tourists.find((t) => t.touristId === targetUser.touristId);
          if (myProfile) setTouristProfile(myProfile);
        }
      }

      // 2. Fetch Digital ID if authenticated
      const targetUser = activeUser || currentUser;
      if (targetUser && targetUser.touristId) {
        fetch(`/api/digital-id/${targetUser.touristId}`, { headers: authHeaders })
          .then((r) => r.json())
          .then((d) => { if (d.success) setDigitalId(d.digitalId); })
          .catch(() => {});
      }

      // 3. Fetch Geo-Fences
      const resG = await fetch('/api/geofences');
      const dataG = await resG.json();
      if (dataG.success) setGeofences(dataG.geofences);

      // 4. Fetch Incidents
      const resI = await fetch('/api/incidents', { headers: authHeaders });
      const dataI = await resI.json();
      if (dataI.success) {
        setIncidents(dataI.incidents);
        const myTid = targetUser?.touristId;
        const sosInc = dataI.incidents.find(
          (i) => myTid && i.touristId === myTid && i.type === 'SOS Emergency' && i.status !== 'RESOLVED'
        );
        setActiveSosIncident(sosInc || null);
      }

      // 5. Fetch Notifications
      const resN = await fetch('/api/notifications');
      const dataN = await resN.json();
      if (dataN.success) setNotifications(dataN.notifications);

      // 6. Fetch Emergency Services
      const resE = await fetch('/api/incidents/emergency-services');
      const dataE = await resE.json();
      if (dataE.success && dataE.emergencyServices) {
        setEmergencyServices(dataE.emergencyServices);
      }
    } catch (err) {
      console.error('Fetch Error:', err);
    }
  };

  // Login Success Handler: Persists user and token to localStorage
  const handleLoginSuccess = (authData) => {
    if (authData?.token) {
      localStorage.setItem('safar_token', authData.token);
    }
    if (authData?.user) {
      localStorage.setItem('safar_user', JSON.stringify(authData.user));
      setCurrentUser(authData.user);
    }
    if (authData?.tourist) {
      setTouristProfile(authData.tourist);
    }
    if (authData?.digitalId) {
      setDigitalId(authData.digitalId);
    }
  };

  // Logout Handler: Cleans up all storage and state
  const handleLogout = () => {
    localStorage.removeItem('safar_token');
    localStorage.removeItem('safar_user');
    setCurrentUser(null);
    setTouristProfile(null);
    setDigitalId(null);
    setActiveSosIncident(null);
  };

  // Quick Tourist Select for Live Demo (Ayodhya, Jammu, Taj Mahal, Real-Time Location)
  const handleSelectTourist = async (targetTouristId) => {
    let target = allTourists.find((t) => t.touristId === targetTouristId);
    if (!target && targetTouristId === 'TID-REAL') {
      target = {
        id: 'tourist_realtime',
        touristId: 'TID-REAL',
        fullName: 'Real-Time Device Tourist',
        email: 'reallive@safetour.gov.in',
        currentLocation: { lat: 28.6139, lng: 77.2090, address: 'My Real-Time Device Location', isLiveGps: true },
        riskScore: 5,
        riskLevel: 'LOW',
        status: 'SAFE'
      };
    }
    if (!target) return;
    setTouristProfile(target);
    const updatedUser = {
      id: target.id || `usr_${target.touristId}`,
      name: target.fullName,
      email: target.email,
      touristId: target.touristId,
      role: 'TOURIST'
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('safar_user', JSON.stringify(updatedUser));

    try {
      const res = await fetch(`/api/digital-id/${targetTouristId}`);
      const data = await res.json();
      if (data.success) setDigitalId(data.digitalId);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger SIH Judge Demo Scenario
  const handleTriggerScenario = async (scenarioId) => {
    try {
      const activeTid = touristProfile?.touristId || currentUser?.touristId || 'TID-1035';
      const res = await fetch(`/api/demo/scenario/${scenarioId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: activeTid })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error('Scenario Error:', err);
    }
  };

  // Quick Role Switcher for Evaluators
  const handleSwitchUser = (role) => {
    if (role === 'AUTHORITY') {
      const authUser = {
        id: 'usr_auth_01',
        name: 'Dr. Ananya Sharma',
        email: 'authority@safetour.gov.in',
        role: 'AUTHORITY',
        department: 'S.A.F.A.R. Central Command Desk'
      };
      setCurrentUser(authUser);
      localStorage.setItem('safar_user', JSON.stringify(authUser));
    } else {
      const defaultTourist = touristProfile || allTourists[0];
      if (defaultTourist) {
        setTouristProfile(defaultTourist);
        const touristUser = {
          id: defaultTourist.id || `usr_${defaultTourist.touristId}`,
          name: defaultTourist.fullName,
          email: defaultTourist.email,
          role: 'TOURIST',
          touristId: defaultTourist.touristId
        };
        setCurrentUser(touristUser);
        localStorage.setItem('safar_user', JSON.stringify(touristUser));
      }
    }
  };

  // Location update handler
  const handleUpdateLocation = async (lat, lng, address, speedKmH, headingDeg, isLiveGps) => {
    try {
      const activeTid = touristProfile?.touristId || currentUser?.touristId;
      if (!activeTid) return;
      const token = localStorage.getItem('safar_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/tourists/location', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          touristId: activeTid, 
          lat, 
          lng, 
          address, 
          speedKmH: speedKmH ?? 0, 
          headingDeg: headingDeg ?? 0, 
          isLiveGps: Boolean(isLiveGps) 
        })
      });
      const data = await res.json();
      if (data.success && data.tourist) {
        setTouristProfile(data.tourist);
        setAllTourists((prev) => 
          prev.map((t) => (t.touristId === activeTid ? data.tourist : t))
        );
      }
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Zone Simulation Handler
  const handleSimulateZone = async (targetZoneType) => {
    try {
      const activeTid = touristProfile?.touristId || currentUser?.touristId || 'TID-1035';
      const res = await fetch('/api/tourists/simulate-zone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: activeTid, targetZoneType })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Route Deviation Simulation Handler
  const handleSimulateDeviation = async () => {
    try {
      const activeTid = touristProfile?.touristId || currentUser?.touristId || 'TID-1035';
      const res = await fetch('/api/trips/simulate-deviation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: activeTid, offsetKm: 3.8 })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger SOS Handler
  const handleTriggerSos = async () => {
    try {
      const activeTid = touristProfile?.touristId || currentUser?.touristId || 'TID-1035';
      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: activeTid })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Cancel SOS Handler
  const handleCancelSos = async (reason) => {
    try {
      const activeTid = touristProfile?.touristId || currentUser?.touristId || 'TID-1035';
      const res = await fetch('/api/sos/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ touristId: activeTid, reason: reason || 'Situation Resolved' })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Incident status update handler
  const handleUpdateIncidentStatus = async (id, status, assignedAuthority, responseNotes, manualSeverityOverride, manualCategoryOverride) => {
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedAuthority, responseNotes, manualSeverityOverride, manualCategoryOverride })
      });
      const data = await res.json();
      await fetchInitialData();
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // Mark notifications read
  const handleMarkRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      await fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Router>
      <AppContent
        showPatrioticLoader={showPatrioticLoader}
        setShowPatrioticLoader={setShowPatrioticLoader}
        showMeshModal={showMeshModal}
        setShowMeshModal={setShowMeshModal}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        touristProfile={touristProfile}
        setTouristProfile={setTouristProfile}
        digitalId={digitalId}
        setDigitalId={setDigitalId}
        allTourists={allTourists}
        setAllTourists={setAllTourists}
        geofences={geofences}
        incidents={incidents}
        notifications={notifications}
        emergencyServices={emergencyServices}
        activeSosIncident={activeSosIncident}
        handleSelectTourist={handleSelectTourist}
        handleTriggerScenario={handleTriggerScenario}
        handleSwitchUser={handleSwitchUser}
        handleUpdateLocation={handleUpdateLocation}
        handleSimulateZone={handleSimulateZone}
        handleSimulateDeviation={handleSimulateDeviation}
        handleTriggerSos={handleTriggerSos}
        handleCancelSos={handleCancelSos}
        handleUpdateIncidentStatus={handleUpdateIncidentStatus}
        handleMarkRead={handleMarkRead}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
        fetchInitialData={fetchInitialData}
      />
    </Router>
  );
}

function AppContent({
  showPatrioticLoader,
  setShowPatrioticLoader,
  showMeshModal,
  setShowMeshModal,
  currentUser,
  setCurrentUser,
  touristProfile,
  setTouristProfile,
  digitalId,
  setDigitalId,
  allTourists,
  setAllTourists,
  geofences,
  incidents,
  notifications,
  emergencyServices,
  activeSosIncident,
  handleSelectTourist,
  handleTriggerScenario,
  handleSwitchUser,
  handleUpdateLocation,
  handleSimulateZone,
  handleSimulateDeviation,
  handleTriggerSos,
  handleCancelSos,
  handleUpdateIncidentStatus,
  handleMarkRead,
  handleLoginSuccess,
  handleLogout,
  fetchInitialData,
}) {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col justify-between" style={{ background: '#F2F2F7', color: '#1C1C1E', fontFamily: "'Inter', -apple-system, 'SF Pro Display', sans-serif" }}>
      
      {/* Patriotic Indian Flag Animated Loading Screen */}
      {showPatrioticLoader && (
        <PatrioticLoader onLoadingComplete={() => {
          try { sessionStorage.setItem('safar_loader_shown', 'true'); } catch {}
          setShowPatrioticLoader(false);
        }} />
      )}

      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkRead={handleMarkRead}
        onOpenMeshModal={() => setShowMeshModal(true)}
        onShowLoader={() => setShowPatrioticLoader(true)}
      />

      {/* Offline Ghost-Mesh Rescue Modal Simulator */}
      <OfflineGhostMeshModal
        isOpen={showMeshModal}
        onClose={() => setShowMeshModal(false)}
      />

      {/* Bottom Dock — iPhone-style tab navigation for tourists */}
      <BottomDock
        currentUser={currentUser}
        onTriggerSos={handleTriggerSos}
      />

      {/* Main Route Body with Silky iOS Page Transitions */}
      <main className={`flex-1 w-full max-w-full overflow-x-hidden ${
        (currentUser?.role === 'TOURIST' && ['/tourist-dashboard', '/digital-id', '/sos', '/fares', '/deadman-switch', '/emergency-help'].includes(location.pathname))
          ? 'pb-36 sm:pb-28'
          : 'pb-12 sm:pb-8'
      }`}>
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14, scale: 0.988 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="page-transition-container"
            >
              <Routes location={location}>
                <Route path="/" element={<LandingPage onScenarioTrigger={handleTriggerScenario} onSwitchUser={handleSwitchUser} />} />

                <Route
                  path="/register"
                  element={<TouristRegister onRegisterSuccess={handleLoginSuccess} />}
                />

                <Route
                  path="/login"
                  element={<LoginPage onLoginSuccess={handleLoginSuccess} />}
                />

                {/* 1. Dedicated Live Safety Map & Tracking Dashboard */}
                <Route
                  path="/tourist-dashboard"
                  element={
                    <TouristDashboard
                      tourist={touristProfile}
                      allTourists={allTourists}
                      onSelectTourist={handleSelectTourist}
                      digitalId={digitalId}
                      geofences={geofences}
                      emergencyServices={emergencyServices}
                      activeSosIncident={activeSosIncident}
                      onUpdateLocation={handleUpdateLocation}
                      onSimulateZone={handleSimulateZone}
                      onSimulateDeviation={handleSimulateDeviation}
                      onTriggerSos={handleTriggerSos}
                      onCancelSos={handleCancelSos}
                    />
                  }
                />
                <Route path="/map" element={<Navigate to="/tourist-dashboard" replace />} />

                {/* 2. Dedicated Digital ID & Blockchain Pass */}
                <Route
                  path="/digital-id"
                  element={
                    <DigitalIdPage
                      tourist={touristProfile}
                      allTourists={allTourists}
                      onSelectTourist={handleSelectTourist}
                    />
                  }
                />
                
                {/* Dedicated Tourist QR Verification Pages */}
                <Route path="/tourist/verify/:touristId" element={<TouristVerifyPage />} />
                <Route path="/verify-id/:id" element={<TouristVerifyPage />} />
                <Route path="/verify-id" element={<Navigate to="/digital-id" replace />} />

                {/* 3. Dedicated Emergency SOS Mission Cockpit */}
                <Route
                  path="/sos"
                  element={
                    <SosPage
                      tourist={touristProfile}
                      activeSosIncident={activeSosIncident}
                      onTriggerSos={handleTriggerSos}
                      onCancelSos={handleCancelSos}
                      emergencyServices={emergencyServices}
                    />
                  }
                />

                {/* 4. Dedicated Local Transport Fares & Budget Guide */}
                <Route
                  path="/fares"
                  element={
                    <FaresPage
                      tourist={touristProfile}
                    />
                  }
                />

                {/* 5. Dedicated 24x7 Emergency Help & Rescue Center */}
                <Route
                  path="/emergency-help"
                  element={
                    <EmergencyHelpPage
                      tourist={touristProfile}
                      emergencyServices={emergencyServices}
                    />
                  }
                />

                {/* 6. Dedicated Automated Deadman's Switch Safety Monitor */}
                <Route
                  path="/deadman-switch"
                  element={
                    <DeadmanSwitchPage
                      tourist={touristProfile}
                      onTriggerSos={handleTriggerSos}
                    />
                  }
                />

                {/* Authority & Management Command Desks */}
                <Route
                  path="/authority-dashboard"
                  element={
                    <AuthorityDashboard
                      tourists={allTourists}
                      geofences={geofences}
                      incidents={incidents}
                      notifications={notifications}
                      emergencyServices={emergencyServices}
                      onUpdateIncidentStatus={handleUpdateIncidentStatus}
                      onRefreshData={fetchInitialData}
                    />
                  }
                />
                <Route path="/authority" element={<Navigate to="/authority-dashboard" replace />} />

                <Route
                  path="/geo-fence-management"
                  element={
                    <GeoFenceManagementPage
                      geofences={geofences}
                      onRefreshData={fetchInitialData}
                    />
                  }
                />

                <Route
                  path="/incidents"
                  element={
                    <IncidentManagementPage
                      incidents={incidents}
                      geofences={geofences}
                      onUpdateStatus={handleUpdateIncidentStatus}
                    />
                  }
                />

                <Route
                  path="/blockchain-ledger"
                  element={<BlockchainLedgerPage />}
                />

                <Route
                  path="/analytics"
                  element={<AnalyticsPage />}
                />

                <Route
                  path="/privacy-compliance"
                  element={<PrivacyCompliancePage />}
                />

                <Route
                  path="/vendor-marketplace"
                  element={<VendorMarketplacePage />}
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </div>
  );
}
