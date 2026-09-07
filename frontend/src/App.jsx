import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import DemoControlPanel from './components/DemoControlPanel';
import BottomDock from './components/BottomDock';

import LandingPage from './pages/LandingPage';
import TouristDashboard from './pages/TouristDashboard';
import TouristRegister from './pages/TouristRegister';
import LoginPage from './pages/LoginPage';
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

  const [currentUser, setCurrentUser] = useState({
    id: 'usr_tourist_ayodhya',
    name: 'Ananya Mishra',
    email: 'ananya.mishra@example.com',
    role: 'TOURIST',
    touristId: 'TID-1035'
  });

  const [touristProfile, setTouristProfile] = useState(null);
  const [digitalId, setDigitalId] = useState(null);
  const [allTourists, setAllTourists] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [activeSosIncident, setActiveSosIncident] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Tourists
      const resT = await fetch('/api/tourists');
      const dataT = await resT.json();
      if (dataT.success) {
        setAllTourists(dataT.tourists);
        setTouristProfile((prev) => {
          if (prev && prev.touristId) {
            return dataT.tourists.find((t) => t.touristId === prev.touristId) || prev;
          }
          return dataT.tourists.find((t) => t.touristId === 'TID-1035') || dataT.tourists[0];
        });
      }

      // 2. Fetch Digital ID
      setDigitalId((prev) => {
        if (!prev) {
          fetch('/api/digital-id/TID-1035')
            .then((r) => r.json())
            .then((d) => { if (d.success) setDigitalId(d.digitalId); })
            .catch(() => {});
        }
        return prev;
      });

      // 3. Fetch Geo-Fences
      const resG = await fetch('/api/geofences');
      const dataG = await resG.json();
      if (dataG.success) setGeofences(dataG.geofences);

      // 4. Fetch Incidents
      const resI = await fetch('/api/incidents');
      const dataI = await resI.json();
      if (dataI.success) {
        setIncidents(dataI.incidents);
        const sosInc = dataI.incidents.find(
          (i) => (i.touristId === (currentUser.touristId || 'TID-1035')) && i.type === 'SOS Emergency' && i.status !== 'RESOLVED'
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
    setCurrentUser((prev) => ({
      ...prev,
      name: target.fullName,
      email: target.email,
      touristId: target.touristId,
      role: 'TOURIST'
    }));
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
      setCurrentUser({
        id: 'usr_auth_01',
        name: 'Dr. Ananya Sharma',
        email: 'authority@safetour.gov.in',
        role: 'AUTHORITY',
        department: 'S.A.F.A.R. Central Command Desk'
      });
    } else {
      const defaultTourist = allTourists.find((t) => t.touristId === 'TID-1035') || allTourists[0];
      if (defaultTourist) setTouristProfile(defaultTourist);
      setCurrentUser({
        id: 'usr_tourist_ayodhya',
        name: defaultTourist?.fullName || 'Ananya Mishra',
        email: defaultTourist?.email || 'ananya.mishra@example.com',
        role: 'TOURIST',
        touristId: defaultTourist?.touristId || 'TID-1035'
      });
    }
  };

  // Location update handler
  const handleUpdateLocation = async (lat, lng, address, speedKmH, headingDeg, isLiveGps) => {
    try {
      const activeTid = touristProfile?.touristId || currentUser?.touristId || 'TID-1035';
      const res = await fetch('/api/tourists/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // Login handler
  const handleLoginSuccess = (loginData) => {
    setCurrentUser(loginData.user);
    if (loginData.tourist) setTouristProfile(loginData.tourist);
    if (loginData.digitalId) setDigitalId(loginData.digitalId);
    fetchInitialData();
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
        onLogout={() => setCurrentUser(null)}
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

      {/* Floating SIH Evaluator Demo Control Panel */}
      <DemoControlPanel
        onTriggerScenario={handleTriggerScenario}
        onSwitchUser={handleSwitchUser}
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
                <Route path="/" element={<LandingPage onScenarioTrigger={handleTriggerScenario} />} />

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
                <Route path="/verify-id" element={<Navigate to="/digital-id" replace />} />
                <Route
                  path="/verify-id/:id"
                  element={<VerifyDigitalIdPage />}
                />

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
